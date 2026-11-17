"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  FolderGit2, 
  Clock, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  CreditCard,
  Plus,
  ArrowRight,
  TrendingUp,
  Activity
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface ClientAnalytics {
  stats: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    openProjects: number;
    pendingProposals: number;
    totalSpent: number;
    pendingPayments: number;
  };
  recentProjects: Array<{
    project_id: number;
    title: string;
    category: string;
    budget: number;
    status: string;
    freelancer_name: string | null;
    total_proposals: number;
    task_progress_pct: string;
    total_paid: number;
  }>;
  recentActivity: Array<{
    id: number;
    title: string;
    message: string;
    created_at: string;
    link?: string;
  }>;
}

export default function ClientDashboard() {
  const [data, setData] = useState<ClientAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiRequest<ClientAnalytics>("/api/analytics/client");
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <DashboardShell
      allowedRole="client"
      title="Client Dashboard"
      subtitle="Overview of your active projects and platform engagements"
      actionButton={
        <Link
          href="/client/projects?action=create"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Post New Project
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
          <p className="text-xs text-slate-500">Querying PostgreSQL views & analytics...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Projects"
              value={data.stats.totalProjects}
              subtitle={`${data.stats.openProjects} open, ${data.stats.activeProjects} in progress`}
              icon={<FolderGit2 className="w-4 h-4" />}
            />
            <MetricCard
              title="Active Workstreams"
              value={data.stats.activeProjects}
              subtitle={`${data.stats.completedProjects} successfully completed`}
              icon={<Clock className="w-4 h-4 text-blue-600" />}
              trend="+12%"
              trendPositive={true}
            />
            <MetricCard
              title="Pending Proposals"
              value={data.stats.pendingProposals}
              subtitle="Awaiting your review & approval"
              icon={<FileText className="w-4 h-4 text-amber-600" />}
            />
            <MetricCard
              title="Total Investment"
              value={`$${data.stats.totalSpent.toLocaleString()}`}
              subtitle={`$${data.stats.pendingPayments.toLocaleString()} pending milestones`}
              icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              trend="Verified"
              trendPositive={true}
            />
          </div>

          {/* Quick Actions & Recent Projects */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Projects from view_project_summaries */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Active & Recent Projects</h3>
                  <p className="text-xs text-slate-400">Calculated from PostgreSQL view_project_summaries</p>
                </div>
                <Link
                  href="/client/projects"
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                >
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data.recentProjects.length === 0 ? (
                <div className="p-8 text-center">
                  <FolderGit2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No projects found. Create your first project to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.recentProjects.map((p) => (
                    <div key={p.project_id} className="p-5 hover:bg-slate-50/70 transition">
                      <div className="flex items-center justify-between mb-2">
                        <Link
                          href={`/client/projects/${p.project_id}`}
                          className="text-sm font-semibold text-slate-900 hover:text-indigo-600 transition"
                        >
                          {p.title}
                        </Link>
                        <StatusBadge status={p.status} />
                      </div>

                      <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500">
                        <span>Category: <strong className="text-slate-700">{p.category}</strong></span>
                        <span>Budget: <strong className="text-slate-700">${Number(p.budget).toLocaleString()}</strong></span>
                        <span>
                          Freelancer:{" "}
                          <strong className="text-slate-700">{p.freelancer_name || "Unassigned"}</strong>
                        </span>
                        <span>Proposals: <strong className="text-slate-700">{p.total_proposals}</strong></span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 rounded-full"
                            style={{ width: `${Math.min(100, Number(p.task_progress_pct))}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-medium text-slate-500 shrink-0">
                          {p.task_progress_pct}% Tasks Complete
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Recent Platform Activity & Notifications */}
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Activity Stream</h3>
                  <p className="text-xs text-slate-400">Triggered milestones and deliverables</p>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-5 flex-1 divide-y divide-slate-100">
                {data.recentActivity.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No recent notifications</p>
                ) : (
                  data.recentActivity.map((act) => (
                    <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-xs font-semibold text-slate-800">{act.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{act.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(act.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100">
                <Link
                  href="/client/proposals"
                  className="w-full inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-2 px-3 rounded-lg transition"
                >
                  Review Incoming Proposals ({data.stats.pendingProposals})
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
