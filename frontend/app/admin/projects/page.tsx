"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FolderGit2, Search, DollarSign, Calendar, Users } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface ProjectItem {
  id: number;
  title: string;
  category: string;
  budget: number;
  budget_type: string;
  deadline: string;
  status: string;
  client_name: string;
  client_email: string;
  freelancer_name: string | null;
  proposals_count: number;
  created_at: string;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function loadProjects() {
      try {
        const res = await apiRequest<{ success: boolean; projects: ProjectItem[] }>(
          "/api/projects?limit=100"
        );
        setProjects(res.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filtered = projects.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.client_name.toLowerCase().includes(q) ||
      (p.freelancer_name && p.freelancer_name.toLowerCase().includes(q))
    );
  });

  return (
    <DashboardShell
      allowedRole="admin"
      title="Platform Projects Monitor"
      subtitle="Complete database registry of all active, open, and completed contracts"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Search Input */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6 max-w-md">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by title, client, or freelancer..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Querying projects directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No projects found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">ID</th>
                  <th className="px-6 py-3.5">Project Title</th>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Assigned Freelancer</th>
                  <th className="px-6 py-3.5">Budget</th>
                  <th className="px-6 py-3.5">Bids</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">#{p.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900">{p.title}</p>
                      <p className="text-[11px] text-slate-400">{p.category}</p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{p.client_name}</td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.freelancer_name || <span className="text-slate-400 italic">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${Number(p.budget).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">{p.proposals_count}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
