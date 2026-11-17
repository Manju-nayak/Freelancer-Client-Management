/**
 * Unified PostgreSQL & pgvector Database Connection
 * 
 * Supports two operational modes:
 * 1. External PostgreSQL Server (via pg.Pool) when DATABASE_URL or POSTGRES_HOST is defined.
 * 2. Embedded Persistent PostgreSQL WASM (via @electric-sql/pglite + pgvector) for zero-config,
 *    frictionless local execution with 100% genuine PostgreSQL & pgvector syntax and capabilities.
 */

const path = require("path");
const fs = require("fs");
const { Pool } = require("pg");
const { PGlite } = require("@electric-sql/pglite");
const { vector } = require("@electric-sql/pglite-pgvector");

let pool = null;
let pgliteInstance = null;
let isEmbedded = false;

async function getDB() {
  if (pool) return { type: "pool", client: pool };
  if (pgliteInstance) return { type: "pglite", client: pgliteInstance };

  // Check if external PostgreSQL connection string is provided
  const dbUrl = process.env.DATABASE_URL;
  const pgHost = process.env.POSTGRES_HOST || process.env.PGHOST;

  if (dbUrl || pgHost) {
    try {
      console.log("Connecting to external PostgreSQL server...");
      const externalPool = new Pool({
        connectionString: dbUrl,
        host: pgHost,
        port: process.env.POSTGRES_PORT || process.env.PGPORT || 5432,
        user: process.env.POSTGRES_USER || process.env.PGUSER || "postgres",
        password: process.env.POSTGRES_PASSWORD || process.env.PGPASSWORD,
        database: process.env.POSTGRES_DB || process.env.PGDATABASE || "freelancehub",
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test connection
      await externalPool.query("SELECT 1 AS connected;");
      pool = externalPool;
      isEmbedded = false;
      console.log("Connected to external PostgreSQL database successfully!");
      return { type: "pool", client: pool };
    } catch (err) {
      console.warn("Could not connect to external PostgreSQL:", err.message);
      console.log("Falling back to embedded PostgreSQL (PGlite + pgvector)...");
    }
  }

  // Use embedded persistent PGlite with pgvector
  const dataDir = path.resolve(__dirname, "../data/pgdata");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log(`Initializing persistent PostgreSQL (PGlite) engine at ${dataDir}...`);
  pgliteInstance = new PGlite(dataDir, {
    extensions: { vector }
  });

  await pgliteInstance.waitReady;
  isEmbedded = true;
  console.log("Persistent PostgreSQL engine with pgvector initialized successfully!");
  return { type: "pglite", client: pgliteInstance };
}

/**
 * Execute a parameterized query
 * @param {string} text SQL query with $1, $2 placeholders
 * @param {Array} params Parameter values
 * @returns {Promise<{ rows: Array, rowCount: number }>}
 */
async function query(text, params = []) {
  const db = await getDB();
  if (db.type === "pool") {
    const res = await db.client.query(text, params);
    return { rows: res.rows, rowCount: res.rowCount };
  } else {
    // PGlite query
    const res = await db.client.query(text, params);
    return { rows: res.rows, rowCount: res.rows ? res.rows.length : 0 };
  }
}

/**
 * Execute a multi-statement SQL script (DDL, schema creation, triggers)
 * @param {string} sql 
 */
async function exec(sql) {
  const db = await getDB();
  if (db.type === "pool") {
    await db.client.query(sql);
  } else {
    await db.client.exec(sql);
  }
}

/**
 * Run operations inside an ACID transaction
 * @param {Function} callback async function(queryFn)
 */
async function transaction(callback) {
  const db = await getDB();
  if (db.type === "pool") {
    const client = await db.client.connect();
    try {
      await client.query("BEGIN;");
      const txQuery = async (t, p = []) => {
        const res = await client.query(t, p);
        return { rows: res.rows, rowCount: res.rowCount };
      };
      const result = await callback(txQuery);
      await client.query("COMMIT;");
      return result;
    } catch (error) {
      await client.query("ROLLBACK;");
      throw error;
    } finally {
      client.release();
    }
  } else {
    // PGlite transaction
    return await db.client.transaction(async (tx) => {
      const txQuery = async (t, p = []) => {
        const res = await tx.query(t, p);
        return { rows: res.rows, rowCount: res.rows ? res.rows.length : 0 };
      };
      return await callback(txQuery);
    });
  }
}

function getDatabaseStatus() {
  return {
    engine: "PostgreSQL with pgvector",
    mode: isEmbedded ? "Embedded WASM PostgreSQL (Persistent Storage)" : "External PostgreSQL Server",
    vectorExtension: true,
  };
}

module.exports = {
  getDB,
  query,
  exec,
  transaction,
  getDatabaseStatus
};
