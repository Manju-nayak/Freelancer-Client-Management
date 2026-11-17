"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  FolderGit2, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  ShieldCheck, 
  Database,
  ArrowRight,
  Star,
  Activity
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import MetricCard from "@/components/MetricCard";
import { apiRequest } from "@/lib/api";

interface AdminAnalyticsData {
  stats: {
    totalUsers: number;
    totalClients: number;
    totalFreelancers: number;
    totalProjects: number;
    openProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalProposals: number;
    totalTransactions: number;
    totalVolume: number;
    avgProjectBudget: number;
  };
  categoryDistribution: Array<{
    category: string;
    count: number;
    avg_budget: number;
  }>;
  monthlyTransactions: Array<{
    month: string;
    transaction_count: number;
    total_amount: number;
  }>;
  topFreelancers: Array<{
    freelancer_id: number;
    name: string;
    title: string;
    rating_avg: number;
    rating_count: number;
    total_earnings: number;
    completed_projects: number;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAdminStats() {
      try {
        const res = await apiRequest<AdminAnalyticsData>("/api/analytics/admin");
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load admin analytics");
      } finally {
        setLoading(false);
      }
    }
    loadAdminStats();
  }, []);

  return (
    <DashboardShell
      allowedRole="admin"
      title="Platform Operations Center"
      subtitle="System-wide metrics calculated live from PostgreSQL view_platform_analytics"
      actionButton={
        <Link
          href="/admin/db-explorer"
          className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Database className="w-3.5 h-3.5" />
          SQL Query Console
        </Link>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Querying platform views & aggregates...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Top KPI Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Registered Accounts"
              value={data.stats.totalUsers}
              subtitle={`${data.stats.totalClients} Clients • ${data.stats.totalFreelancers} Freelancers`}
              icon={<Users className="w-4 h-4 text-indigo-600" />}
            />
            <MetricCard
              title="Platform Projects"
              value={data.stats.totalProjects}
              subtitle={`${data.stats.openProjects} open, ${data.stats.activeProjects} active, ${data.stats.completedProjects} done`}
              icon={<FolderGit2 className="w-4 h-4 text-blue-600" />}
            />
            <MetricCard
              title="Gross Transaction Volume"
              value={`$${data.stats.totalVolume.toLocaleString()}`}
              subtitle={`${data.stats.totalTransactions} completed payments`}
              icon={<CreditCard className="w-4 h-4 text-emerald-600" />}
              trend="ACID"
              trendPositive={true}
            />
            <MetricCard
              title="Total Bids Submitted"
              value={data.stats.totalProposals}
              subtitle={`Avg project budget: $${Math.round(data.stats.avgProjectBudget).toLocaleString()}`}
              icon={<FileText className="w-4 h-4 text-amber-600" />}
            />
          </div>

          {/* 2-Column Analytics Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Breakdown (GROUP BY in PostgreSQL) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Project Domain Breakdown</h3>
                  <p className="text-xs text-slate-400">PostgreSQL GROUP BY & Aggregate stats</p>
                </div>
                <TrendingUp className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-6 space-y-4">
                {data.categoryDistribution.map((cat) => (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{cat.category}</span>
                      <span className="text-slate-500">
                        <strong>{cat.count}</strong> projects (Avg: ${Math.round(cat.avg_budget).toLocaleString()})
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full"
                        style={{
                          width: `${Math.max(15, (cat.count / data.stats.totalProjects) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Rated Freelancers (JOIN & View performance) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Top Rated Talent</h3>
                  <p className="text-xs text-slate-400">Queried from view_freelancer_performance</p>
                </div>
                <Link
                  href="/admin/users?role=freelancer"
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                >
                  View All &rarr;
                </Link>
              </div>

              <div className="p-6 flex-1 divide-y divide-slate-100">
                {data.topFreelancers.map((f) => (
                  <div key={f.freelancer_id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{f.name}</h4>
                      <p className="text-[11px] text-slate-500">{f.title}</p>
                      <span className="text-[10px] text-slate-400">
                        {f.completed_projects} projects completed • ${Number(f.total_earnings).toLocaleString()} earned
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-amber-900">{f.rating_avg}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Management Links */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Link
              href="/admin/users"
              className="bg-white p-5 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition"
            >
              <Users className="w-5 h-5 text-indigo-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Manage Users</h4>
              <p className="text-xs text-slate-400 mt-1">Activate, inspect, and audit accounts</p>
            </Link>

            <Link
              href="/admin/projects"
              className="bg-white p-5 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition"
            >
              <FolderGit2 className="w-5 h-5 text-blue-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Monitor Projects</h4>
              <p className="text-xs text-slate-400 mt-1">View client scopes and freelancer assignments</p>
            </Link>

            <Link
              href="/admin/transactions"
              className="bg-white p-5 rounded-xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-xs transition"
            >
              <CreditCard className="w-5 h-5 text-emerald-600 mb-2" />
              <h4 className="text-sm font-bold text-slate-900">Transactions Ledger</h4>
              <p className="text-xs text-slate-400 mt-1">Audit escrow flows and platform disbursements</p>
            </Link>

            <Link
              href="/admin/db-explorer"
              className="bg-purple-50/50 p-5 rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-xs transition"
            >
              <Database className="w-5 h-5 text-purple-600 mb-2" />
              <h4 className="text-sm font-bold text-purple-900">Interactive SQL Console</h4>
              <p className="text-xs text-purple-700/70 mt-1">Live demo of JOINs, Views, Triggers & Vectors</p>
            </Link>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
