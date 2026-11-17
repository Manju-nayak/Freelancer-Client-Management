"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Clock, DollarSign, Calendar, ArrowRight } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface FreelancerProposal {
  id: number;
  project_id: number;
  project_title: string;
  project_budget: number;
  project_deadline: string;
  project_status: string;
  client_name: string;
  proposed_budget: number;
  estimated_duration: string;
  cover_letter: string;
  status: string;
  created_at: string;
}

export default function FreelancerProposalsPage() {
  const [proposals, setProposals] = useState<FreelancerProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchProposals() {
      try {
        const res = await apiRequest<{ success: boolean; proposals: FreelancerProposal[] }>(
          "/api/proposals/my-proposals"
        );
        setProposals(res.proposals || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load proposals");
      } finally {
        setLoading(false);
      }
    }
    fetchProposals();
  }, []);

  const filtered = proposals.filter((p) => {
    if (filter === "All") return true;
    return p.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <DashboardShell
      allowedRole="freelancer"
      title="My Proposals"
      subtitle="Track the status of all your submitted bids and client assignments"
      actionButton={
        <Link
          href="/freelancer/projects"
          className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          Find More Projects
        </Link>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["All", "pending", "accepted", "rejected"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filter.toLowerCase() === st.toLowerCase()
                ? "bg-slate-900 text-white font-semibold"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Querying proposals from PostgreSQL database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No proposals found</p>
          <p className="text-xs text-slate-500 mt-1">
            Browse available projects and submit bids to start working.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">
                    <Link
                      href={`/freelancer/projects/${prop.project_id}`}
                      className="hover:text-indigo-600 transition"
                    >
                      {prop.project_title}
                    </Link>
                  </h3>
                  <StatusBadge status={prop.status} />
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100 whitespace-pre-line">
                  {prop.cover_letter}
                </p>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    Your Bid: <strong className="text-slate-900">${Number(prop.proposed_budget).toLocaleString()}</strong>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Delivery Timeline: <strong className="text-slate-900">{prop.estimated_duration}</strong>
                  </span>
                  <span>Client: <strong className="text-slate-700">{prop.client_name}</strong></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Submitted: {new Date(prop.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {prop.status === "accepted" && (
                <div className="shrink-0 self-center md:self-start">
                  <Link
                    href="/freelancer/tasks"
                    className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-emerald-100 transition"
                  >
                    Go to Work Tasks
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
