"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  DollarSign, 
  Briefcase, 
  CheckSquare, 
  Star, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  FileText
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import MetricCard from "@/components/MetricCard";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface FreelancerAnalytics {
  stats: {
    availableProjects: number;
    submittedProposals: number;
    acceptedProposals: number;
    activeProjects: number;
    completedProjects: number;
    totalEarnings: number;
    averageRating: number;
    ratingCount: number;
    completionRate: number;
  };
  recommendations: Array<{
    id: number;
    title: string;
    description: string;
    category: string;
    budget: number;
    budget_type: string;
    deadline: string;
    client_name: string;
    match_score: string;
  }>;
  activeTasks: Array<{
    id: number;
    title: string;
    project_title: string;
    status: string;
    priority: string;
    due_date: string;
  }>;
  recentActivity: Array<{
    id: number;
    title: string;
    message: string;
    created_at: string;
  }>;
}

export default function FreelancerDashboard() {
  const [data, setData] = useState<FreelancerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await apiRequest<FreelancerAnalytics>("/api/analytics/freelancer");
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load freelancer dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <DashboardShell
      allowedRole="freelancer"
      title="Freelancer Dashboard"
      subtitle="Track your earnings, active assignments, and pgvector project matches"
      actionButton={
        <Link
          href="/freelancer/projects"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Briefcase className="w-3.5 h-3.5" />
          Browse Projects
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
          <p className="text-xs text-slate-500">Querying PostgreSQL views & pgvector embeddings...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* KPI Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Net Earnings"
              value={`$${data.stats.totalEarnings.toLocaleString()}`}
              subtitle="Completed milestones & escrow payouts"
              icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
              trend="Verified"
              trendPositive={true}
            />
            <MetricCard
              title="Active Projects"
              value={data.stats.activeProjects}
              subtitle={`${data.stats.completedProjects} projects completed`}
              icon={<Briefcase className="w-4 h-4 text-blue-600" />}
            />
            <MetricCard
              title="Client Rating"
              value={`${data.stats.averageRating} / 5.0`}
              subtitle={`${data.stats.ratingCount} client evaluations`}
              icon={<Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
              trend={`${data.stats.completionRate}% Done`}
              trendPositive={true}
            />
            <MetricCard
              title="Proposal Win Rate"
              value={`${data.stats.acceptedProposals} of ${data.stats.submittedProposals}`}
              subtitle="Proposals submitted and accepted"
              icon={<FileText className="w-4 h-4 text-purple-600" />}
            />
          </div>

          {/* AI Semantic Recommendations (PostgreSQL pgvector) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    AI Semantic Project Matches (pgvector Cosine Search)
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calculated dynamically in PostgreSQL by comparing your profile embedding with open project requirements
                </p>
              </div>
              <Link
                href="/freelancer/projects?tab=ai"
                className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
              >
                View All Matches <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {data.recommendations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No new unapplied open projects at this moment.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                {data.recommendations.map((rec) => (
                  <div key={rec.id} className="p-6 hover:bg-slate-50/70 transition space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <Link
                        href={`/freelancer/projects/${rec.id}`}
                        className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition"
                      >
                        {rec.title}
                      </Link>
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        {rec.match_score}% Match
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {rec.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
                      <span>Budget: <strong className="text-slate-900">${Number(rec.budget).toLocaleString()}</strong></span>
                      <span>Client: <strong className="text-slate-900">{rec.client_name}</strong></span>
                      <Link
                        href={`/freelancer/projects/${rec.id}`}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Submit Proposal &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Tasks & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Active Tasks (Left 2 Cols) */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Assigned Tasks</h3>
                  <p className="text-xs text-slate-400">Current work items across your active projects</p>
                </div>
                <Link
                  href="/freelancer/tasks"
                  className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 flex items-center gap-1"
                >
                  Go to Tasks <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {data.activeTasks.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No pending tasks assigned. You are all caught up!
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {data.activeTasks.map((task) => (
                    <div key={task.id} className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckSquare className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{task.title}</p>
                          <span className="text-[11px] text-slate-400">
                            Project: {task.project_title} | Priority: <strong className="capitalize">{task.priority}</strong>
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={task.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Notifications (Right Col) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                <p className="text-xs text-slate-400">Recent project milestones & alerts</p>
              </div>

              <div className="p-5 divide-y divide-slate-100">
                {data.recentActivity.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No recent alerts</p>
                ) : (
                  data.recentActivity.map((notif) => (
                    <div key={notif.id} className="py-3 first:pt-0 last:pb-0">
                      <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardShell>
  );
}
