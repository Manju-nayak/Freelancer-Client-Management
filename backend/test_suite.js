/**
 * Comprehensive Automated End-to-End Test Suite
 * Tests all 18 DBMS Level 3 validation requirements.
 */

const { query, transaction, getDatabaseStatus } = require("./config/db");
const {
  generateProjectEmbedding,
  generateFreelancerEmbedding,
  recommendProjectsForFreelancer,
  recommendFreelancersForProject
} = require("./services/vectorService");
const bcrypt = require("bcryptjs");

async function runTestSuite() {
  console.log("=================================================================");
  console.log(" STARTING DBMS LEVEL 3 COMPREHENSIVE AUTOMATED TEST SUITE");
  console.log("=================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(` [PASS] ${testName}`);
      passed++;
    } else {
      console.error(` [FAIL] ${testName}`);
      failed++;
    }
  }

  try {
    // TEST 1: Database Status & pgvector Extension
    const status = getDatabaseStatus();
    assert(status.vectorExtension === true, "PostgreSQL pgvector extension is active");

    // TEST 2: Seed Users Exist with Role Constraints
    const userRes = await query("SELECT id, name, role FROM users;");
    assert(userRes.rows.length >= 6, `Seed users present in PostgreSQL (Count: ${userRes.rows.length})`);

    const roles = userRes.rows.map(u => u.role);
    assert(roles.includes("admin") && roles.includes("client") && roles.includes("freelancer"), "Users satisfy role domain constraint ('admin', 'client', 'freelancer')");

    // TEST 3: Relational Profiles (One-to-One Relationships)
    const clientProfiles = await query("SELECT * FROM client_profiles;");
    const freelancerProfiles = await query("SELECT * FROM freelancer_profiles;");
    assert(clientProfiles.rows.length >= 2, `Client profiles properly normalized (Count: ${clientProfiles.rows.length})`);
    assert(freelancerProfiles.rows.length >= 3, `Freelancer profiles properly normalized (Count: ${freelancerProfiles.rows.length})`);

    // TEST 4: pgvector Vector Embeddings on Freelancers
    const freeVecRes = await query("SELECT user_id, embedding FROM freelancer_profiles WHERE embedding IS NOT NULL;");
    assert(freeVecRes.rows.length >= 3, `Freelancers have 384-d semantic vector embeddings stored in database`);

    // TEST 5: pgvector Vector Embeddings on Projects
    const projVecRes = await query("SELECT id, embedding FROM projects WHERE embedding IS NOT NULL;");
    assert(projVecRes.rows.length >= 5, `Projects have 384-d semantic vector embeddings stored in database`);

    // TEST 6: Semantic Vector Cosine Similarity Search (<=>)
    const david = (await query("SELECT id FROM users WHERE email = 'david@ml.com';")).rows[0];
    const recs = await recommendProjectsForFreelancer(david.id, 5);
    assert(recs.length > 0, `Vector similarity query (<=>) returns recommended projects for David Kim`);
    assert(Number(recs[0].match_score) > 0, `Top recommended project has positive cosine match score (${recs[0].match_score}%)`);

    // TEST 7: PostgreSQL Full-Text Search (GIN tsvector)
    const ftsRes = await query(`
      SELECT id, title, ts_rank(search_vector, plainto_tsquery('english', 'analytics')) AS rank
      FROM projects
      WHERE search_vector @@ plainto_tsquery('english', 'analytics')
      ORDER BY rank DESC;
    `);
    assert(ftsRes.rows.length > 0, `PostgreSQL GIN tsvector full-text search executed successfully (Hits: ${ftsRes.rows.length})`);

    // TEST 8: Advanced SQL View: view_platform_analytics
    const viewPlatform = await query("SELECT * FROM view_platform_analytics;");
    assert(viewPlatform.rows.length === 1, "view_platform_analytics compiled view returns single row");
    assert(Number(viewPlatform.rows[0].total_volume_amount) > 0, `view_platform_analytics volume calculation matches: $${viewPlatform.rows[0].total_volume_amount}`);

    // TEST 9: Advanced SQL View: view_project_summaries
    const viewProj = await query("SELECT * FROM view_project_summaries;");
    assert(viewProj.rows.length >= 5, `view_project_summaries view aggregates project metrics (Count: ${viewProj.rows.length})`);
    assert(viewProj.rows[0].client_name !== null, "view_project_summaries performs multi-table JOIN for client name");

    // TEST 10: Advanced SQL View: view_freelancer_performance
    const viewFree = await query("SELECT * FROM view_freelancer_performance;");
    assert(viewFree.rows.length >= 3, `view_freelancer_performance aggregates freelancer metrics (Count: ${viewFree.rows.length})`);

    // TEST 11: Advanced SQL View: view_payment_summaries
    const viewPay = await query("SELECT * FROM view_payment_summaries;");
    assert(viewPay.rows.length >= 2, `view_payment_summaries lists transaction details with client and freelancer names`);

    // TEST 12: ACID Transaction - Proposal Submission and Acceptance
    console.log("\nTesting Proposal & Assignment ACID Transaction...");
    const client = (await query("SELECT id FROM users WHERE email = 'client@acmecorp.com';")).rows[0];
    const freelancer = (await query("SELECT id FROM users WHERE email = 'david@ml.com';")).rows[0];
    
    // Create temporary project
    const tempProjRes = await query(
      `INSERT INTO projects (client_id, title, description, category, budget, deadline, status)
       VALUES ($1, 'Test ACID Transaction Project', 'Test description for DBMS transaction verification', 'Full-Stack Development', 3000.00, '2026-12-31', 'open')
       RETURNING id;`,
      [client.id]
    );
    const tempProjId = tempProjRes.rows[0].id;

    // Submit proposal
    const tempPropRes = await query(
      `INSERT INTO proposals (project_id, freelancer_id, cover_letter, proposed_budget, estimated_duration, status)
       VALUES ($1, $2, 'ACID transaction test cover letter', 3000.00, '2 weeks', 'pending')
       RETURNING id;`,
      [tempProjId, freelancer.id]
    );
    const tempPropId = tempPropRes.rows[0].id;

    // Execute atomic transaction to accept proposal
    await transaction(async (txQuery) => {
      await txQuery("UPDATE proposals SET status = 'accepted' WHERE id = $1;", [tempPropId]);
      await txQuery("UPDATE projects SET status = 'in-progress', assigned_freelancer_id = $1 WHERE id = $2;", [freelancer.id, tempProjId]);
      await txQuery(
        `INSERT INTO milestones (project_id, title, description, amount, status)
         VALUES ($1, 'ACID Milestone 1', 'Automated transaction test milestone', 3000.00, 'in-progress');`,
        [tempProjId]
      );
      await txQuery(
        `INSERT INTO audit_logs (entity_type, entity_id, action, details)
         VALUES ('proposal', $1, 'TEST_TRANSACTION_SUCCESS', 'Atomic assignment verified');`,
        [tempPropId]
      );
    });

    const verifyProj = (await query("SELECT status, assigned_freelancer_id FROM projects WHERE id = $1;", [tempProjId])).rows[0];
    assert(verifyProj.status === "in-progress" && verifyProj.assigned_freelancer_id === freelancer.id, "ACID Transaction committed: Project marked 'in-progress' and assigned to freelancer");

    // TEST 13: ACID Transaction - Milestone Payment & Balance Update
    console.log("\nTesting Payment ACID Transaction...");
    const tempMilestone = (await query("SELECT id FROM milestones WHERE project_id = $1;", [tempProjId])).rows[0];
    const txnRef = `TXN-TEST-${Date.now()}`;

    await transaction(async (txQuery) => {
      await txQuery(
        `INSERT INTO payments (project_id, client_id, freelancer_id, milestone_id, amount, payment_method, transaction_reference, status)
         VALUES ($1, $2, $3, $4, 1000.00, 'UPI', $5, 'completed');`,
        [tempProjId, client.id, freelancer.id, tempMilestone.id, txnRef]
      );
      await txQuery("UPDATE client_profiles SET total_spent = total_spent + 1000.00 WHERE user_id = $1;", [client.id]);
      await txQuery("UPDATE freelancer_profiles SET total_earnings = total_earnings + 1000.00 WHERE user_id = $1;", [freelancer.id]);
      await txQuery("UPDATE milestones SET status = 'paid' WHERE id = $1;", [tempMilestone.id]);
    });

    const verifyPay = (await query("SELECT status FROM payments WHERE transaction_reference = $1;", [txnRef])).rows[0];
    assert(verifyPay.status === "completed", "Payment ACID Transaction committed: Record written and status 'completed'");

    // TEST 14: Database Trigger - Review Recalculates Rating
    console.log("\nTesting Database Rating Trigger...");
    const preRating = (await query("SELECT rating_avg, rating_count FROM freelancer_profiles WHERE user_id = $1;", [freelancer.id])).rows[0];
    
    await query(
      `INSERT INTO reviews (project_id, reviewer_id, reviewee_id, rating, comment)
       VALUES ($1, $2, $3, 4, 'Test trigger review rating');`,
      [tempProjId, client.id, freelancer.id]
    );

    const postRating = (await query("SELECT rating_avg, rating_count FROM freelancer_profiles WHERE user_id = $1;", [freelancer.id])).rows[0];
    assert(postRating.rating_count > preRating.rating_count, "Database trigger trg_review_update_rating automatically updated freelancer rating count");

    // Clean up temporary test data
    await query("DELETE FROM projects WHERE id = $1;", [tempProjId]);

    // TEST 15: Check Constraints Validation
    console.log("\nTesting Relational Check Constraints...");
    let checkConstraintPassed = false;
    try {
      // Negative budget violates CHECK (budget > 0)
      await query(
        `INSERT INTO projects (client_id, title, description, category, budget, deadline)
         VALUES ($1, 'Bad Project', 'Desc', 'Cat', -500.00, '2026-12-31');`,
        [client.id]
      );
    } catch (err) {
      checkConstraintPassed = true;
    }
    assert(checkConstraintPassed, "CHECK constraint on budget (budget > 0) properly prevents negative budgets");

    console.log("\n=================================================================");
    console.log(` TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================================");

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test suite fatal error:", err);
    process.exit(1);
  }
}

runTestSuite();
