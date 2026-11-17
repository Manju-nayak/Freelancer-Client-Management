"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Clock, 
  Star, 
  Briefcase,
  AlertCircle
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface ProposalItem {
  id: number;
  project_id: number;
  freelancer_id: number;
  cover_letter: string;
  proposed_budget: number;
  estimated_duration: string;
  status: string;
  created_at: string;
  freelancer_name: string;
  freelancer_email: string;
  freelancer_title: string | null;
  hourly_rate: number | null;
  experience_years: number | null;
  rating_avg: number | null;
  rating_count: number | null;
}

interface ProjectBrief {
  project_id: number;
  title: string;
}

function ProposalsContent() {
  const searchParams = useSearchParams();
  const queryProjectId = searchParams.get("projectId");

  const [projects, setProjects] = useState<ProjectBrief[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(queryProjectId || "");
  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // 1. Fetch Client Projects for selector
  useEffect(() => {
    async function fetchClientProjects() {
      try {
        const res = await apiRequest<{ success: boolean; projects: ProjectBrief[] }>(
          "/api/projects/my-projects"
        );
        const list = res.projects || [];
        setProjects(list);
        if (!selectedProjectId && list.length > 0) {
          setSelectedProjectId(String(list[0].project_id));
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      }
    }
    fetchClientProjects();
  }, [selectedProjectId]);

  // 2. Fetch Proposals for the selected project
  useEffect(() => {
    if (!selectedProjectId) {
      setLoading(false);
      return;
    }

    async function fetchProposals() {
      setLoading(true);
      try {
        const res = await apiRequest<{ success: boolean; proposals: ProposalItem[] }>(
          `/api/proposals/project/${selectedProjectId}`
        );
        setProposals(res.proposals || []);
      } catch (err) {
        setProposals([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, [selectedProjectId]);

  const handleUpdateStatus = async (proposalId: number, newStatus: "accepted" | "rejected") => {
    if (
      newStatus === "accepted" &&
      !confirm("Accepting this proposal will execute an ACID transaction to assign this freelancer, reject other open proposals, and set the project to In-Progress. Proceed?")
    ) {
      return;
    }

    setActionLoading(proposalId);
    setMessage(null);

    try {
      const res = await apiRequest<{ success: boolean; message: string }>(
        `/api/proposals/${proposalId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      setMessage({ text: res.message, type: "success" });

      // Refresh proposals
      const ref = await apiRequest<{ success: boolean; proposals: ProposalItem[] }>(
        `/api/proposals/project/${selectedProjectId}`
      );
      setProposals(ref.proposals || []);
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error processing proposal",
        type: "error",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {message && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          {message.text}
        </div>
      )}

      {/* Project Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider shrink-0">
            Select Project:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {projects.map((p) => (
              <option key={p.project_id} value={p.project_id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        {selectedProjectId && (
          <Link
            href={`/client/projects/${selectedProjectId}`}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View Project Details &rarr;
          </Link>
        )}
      </div>

      {/* Proposals List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Retrieving proposal applications from PostgreSQL...</p>
        </div>
      ) : proposals.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No proposals received yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Freelancers will submit bids with proposed budgets and delivery timelines.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="flex-1 space-y-4">
                {/* Freelancer Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-600 text-sm">
                      {prop.freelancer_name ? prop.freelancer_name.charAt(0).toUpperCase() : "F"}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{prop.freelancer_name}</h3>
                      <p className="text-xs text-slate-500">{prop.freelancer_title || "Freelancer"}</p>
                    </div>
                  </div>
                  <StatusBadge status={prop.status} />
                </div>

                {/* Cover Letter */}
                <div className="bg-slate-50/70 rounded-lg p-4 border border-slate-100 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {prop.cover_letter}
                </div>

                {/* Stats Bar */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Bid: <strong className="text-slate-900">${Number(prop.proposed_budget).toLocaleString()}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Timeline: <strong className="text-slate-900">{prop.estimated_duration}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    Rating: <strong className="text-slate-900">{prop.rating_avg || "5.0"}</strong> ({prop.rating_count || 0} reviews)
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    Experience: <strong className="text-slate-900">{prop.experience_years || 1} yrs</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row md:flex-col items-center md:items-end gap-2 shrink-0 pt-2">
                {prop.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(prop.id, "accepted")}
                      disabled={actionLoading === prop.id}
                      className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {actionLoading === prop.id ? "Assigning..." : "Accept & Assign"}
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(prop.id, "rejected")}
                      disabled={actionLoading === prop.id}
                      className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-rose-50 text-rose-600 text-xs font-semibold px-3 py-2 rounded-lg transition disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-slate-400 font-medium capitalize">
                    Decision: {prop.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientProposalsPage() {
  return (
    <DashboardShell
      allowedRole="client"
      title="Proposal Reviews"
      subtitle="Compare freelancer bids, profiles, and execute assignments via SQL transactions"
    >
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading proposals...</div>}>
        <ProposalsContent />
      </Suspense>
    </DashboardShell>
  );
}
