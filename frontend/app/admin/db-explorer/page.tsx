"use client";

import React, { useState } from "react";
import { Database, Play, Sparkles, Clock, CheckCircle2, AlertCircle, Code, Layers } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { apiRequest } from "@/lib/api";

interface QueryResult {
  title: string;
  sql: string;
  executionTimeMs: string;
  rowCount: number;
  columns: string[];
  data: Record<string, unknown>[];
  dbStatus: {
    engine: string;
    mode: string;
    vectorExtension: boolean;
  };
}

export default function AdminDbExplorerPage() {
  const [selectedPreset, setSelectedPreset] = useState("multi_table_join");
  const [customSql, setCustomSql] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState("");

  const presets = [
    {
      id: "multi_table_join",
      name: "1. Multi-Table JOIN + Aggregations",
      description: "Demonstrates 4-table INNER/LEFT JOINs across projects, users, tasks, and payments with GROUP BY and aggregate functions.",
    },
    {
      id: "subquery_aggregation",
      name: "2. Nested Subqueries & Spending Tiers",
      description: "Demonstrates scalar subqueries and CASE expressions comparing individual client spending against platform averages.",
    },
    {
      id: "view_inspection",
      name: "3. PostgreSQL Views (view_freelancer_performance)",
      description: "Queries an advanced compiled SQL view calculating ratings, active projects, and completion percentages.",
    },
    {
      id: "full_text_search",
      name: "4. PostgreSQL GIN Full-Text Search",
      description: "Demonstrates tsvector, plainto_tsquery, and ts_rank ordering for natural language project discovery.",
    },
    {
      id: "vector_similarity",
      name: "5. pgvector Cosine Distance (<=>)",
      description: "Demonstrates vector similarity queries ranking projects and freelancers via 384-dimensional dense semantic embeddings.",
    },
  ];

  const handleRunQuery = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await apiRequest<{ success: boolean } & QueryResult>(
        "/api/admin/db-query-demo",
        {
          method: "POST",
          body: JSON.stringify({
            queryType: useCustom ? null : selectedPreset,
            customSql: useCustom ? customSql : null,
          }),
        }
      );
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error executing query");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      allowedRole="admin"
      title="Interactive SQL & Vector Query Console"
      subtitle="Live demonstrator for relational operations, advanced SQL views, full-text search, and pgvector embeddings"
    >
      <div className="space-y-6">
        {/* Architecture Specs Banner */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold">Dual Database Engine: PostgreSQL + pgvector</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Normalized relational schema with 15 tables, ACID transactions, GIN full-text indexes, triggers, compiled views, and 384-d semantic vector matching.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              pgvector Active
            </span>
          </div>
        </div>

        {/* Query Controls */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUseCustom(false)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                  !useCustom
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Preset Query Library
              </button>
              <button
                type="button"
                onClick={() => setUseCustom(true)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition ${
                  useCustom
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Custom SQL Editor
              </button>
            </div>

            <button
              onClick={handleRunQuery}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              {loading ? "Executing on PostgreSQL..." : "Execute Query"}
            </button>
          </div>

          {!useCustom ? (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Advanced SQL Concept to Demonstrate:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {presets.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPreset(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition text-left ${
                      selectedPreset === p.id
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <h4 className="text-xs font-bold text-slate-900">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Custom PostgreSQL Query:
              </label>
              <textarea
                rows={4}
                value={customSql}
                onChange={(e) => setCustomSql(e.target.value)}
                placeholder="SELECT p.title, p.budget, u.name AS client FROM projects p JOIN users u ON p.client_id = u.id LIMIT 5;"
                className="w-full font-mono text-xs p-4 bg-slate-900 text-emerald-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            {error}
          </div>
        )}

        {/* Live Results Panel */}
        {result && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
            {/* Header info */}
            <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{result.title}</h3>
                <p className="text-xs text-slate-500">
                  Returned {result.rowCount} rows • Engine: {result.dbStatus.engine}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded border border-slate-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Execution: {result.executionTimeMs}
                </span>
              </div>
            </div>

            {/* Formatted SQL Code Box */}
            <div className="px-6">
              <div className="bg-slate-900 rounded-xl p-4 text-emerald-400 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed border border-slate-800">
                {result.sql}
              </div>
            </div>

            {/* Results Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/80 text-slate-600 font-semibold uppercase tracking-wider border-y border-slate-200">
                  <tr>
                    {result.columns.map((col) => (
                      <th key={col} className="px-6 py-3 whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {result.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      {result.columns.map((col) => (
                        <td key={col} className="px-6 py-3.5 text-slate-700 font-mono text-[11px] whitespace-nowrap">
                          {row[col] === null || row[col] === undefined
                            ? <span className="text-slate-300 italic">null</span>
                            : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
