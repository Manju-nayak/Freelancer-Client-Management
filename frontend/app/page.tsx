"use client";

import Link from "next/link";
import { 
  Database, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Briefcase, 
  Users, 
  Layers, 
  Code2,
  Lock,
  Zap
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-150">
      {/* Top Navbar */}
      <nav className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 px-6 sm:px-12 flex items-center justify-between transition-colors">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">FreelanceHub</span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 ml-1">
            Enterprise AI
          </span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-4">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 transition"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6 sm:px-12 max-w-6xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Dual Paradigm: PostgreSQL Relational + pgvector Semantic AI</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight">
          Next-Generation Freelancer & Client Collaboration
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Enterprise-grade freelance and client management platform featuring semantic vector project matching, real-time escrow tracking, atomic contract agreements, and transparent governance.
        </p>

        {/* Call to Actions */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-indigo-500/25 transition"
          >
            Explore Live Demo <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/admin/db-explorer"
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 text-sm font-bold px-6 py-3 rounded-xl shadow-xs transition"
          >
            <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Live SQL Explorer
          </Link>
        </div>

        {/* Demo Roles Bar */}
        <div className="pt-8 max-w-3xl mx-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <Link
              href="/login"
              className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-blue-100 dark:border-blue-900/40 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Client Role</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform">Demo &rarr;</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Sarah Jenkins (Acme)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Post projects, compare bids, fund escrow</p>
            </Link>

            <Link
              href="/login"
              className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Freelancer Role</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">Demo &rarr;</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Alex Rivera (Senior Eng)</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Submit bids, manage tasks, track earnings</p>
            </Link>

            <Link
              href="/login"
              className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Admin Role</span>
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-0.5 transition-transform">Demo &rarr;</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">Platform Administrator</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">System analytics, audit logs, SQL runner</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Advanced Platform Features Grid */}
      <section className="py-16 px-6 sm:px-12 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Engineered for High-Scale Enterprise Performance
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            100% genuine database operations executed on PostgreSQL with persistent storage and pgvector extension.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. ACID Transactions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Proposal acceptance and milestone disbursements run in atomic transactions ensuring consistent balance and status state transitions.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. pgvector Semantic Search</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              384-dimensional dense semantic embeddings compared using the PostgreSQL cosine distance operator (<code className="font-mono text-[11px]">&lt;=&gt;</code>).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Compiled SQL Views</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Optimized views <code className="font-mono text-[11px]">view_project_summaries</code>, <code className="font-mono text-[11px]">view_freelancer_performance</code>, and <code className="font-mono text-[11px]">view_platform_analytics</code>.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Stored Procedures & Triggers</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Triggers automatically calculate ratings (<code className="font-mono text-[11px]">trg_review_update_rating</code>), sync search vectors, and log status audit events.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">5. GIN Full-Text Indexing</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Natural language project search powered by PostgreSQL <code className="font-mono text-[11px]">to_tsvector</code>, weighted lexemes, and GIN inverted indexes.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">6. Relational Normalization</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              15 properly normalized tables with foreign keys, CASCADE rules, UNIQUE constraints, and CHECK clauses.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 px-6 sm:px-12 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>
          FreelanceHub &bull; Modern Freelancer & Client Management &bull; Powered by PostgreSQL & pgvector.
        </p>
      </footer>
    </div>
  );
}
