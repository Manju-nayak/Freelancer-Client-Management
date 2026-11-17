"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Sparkles, 
  DollarSign, 
  Calendar, 
  Users, 
  ChevronRight, 
  ArrowRight,
  Filter
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  budget_type: string;
  deadline: string;
  experience_level: string;
  status: string;
  client_name: string;
  proposals_count: number;
  skills: string[];
}

interface RecommendedProject {
  id: number;
  title: string;
  description: string;
  category: string;
  budget: number;
  budget_type: string;
  deadline: string;
  experience_level: string;
  client_name: string;
  match_score: string;
}

function FreelancerProjectsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "ai" ? "ai" : "all";

  const [activeTab, setActiveTab] = useState<"all" | "ai">(initialTab);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const fetchProjects = async () => {
    setLoading(true);
    try {
      // 1. Fetch general projects with full-text search and filters
      let url = `/api/projects?status=open&category=${selectedCategory}`;
      if (searchQuery.trim()) {
        url += `&q=${encodeURIComponent(searchQuery.trim())}`;
      }
      const res = await apiRequest<{ success: boolean; projects: ProjectItem[] }>(url);
      setProjects(res.projects || []);

      // 2. Fetch pgvector recommendations
      const recRes = await apiRequest<{ success: boolean; recommendations: RecommendedProject[] }>(
        "/api/projects/recommendations"
      );
      setRecommendations(recRes.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-2 ${
            activeTab === "all"
              ? "border-indigo-600 text-indigo-600 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All Available Projects ({projects.length})
        </button>
        <button
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
            activeTab === "ai"
              ? "border-indigo-600 text-indigo-600 bg-white"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          AI Semantic Matches (pgvector) ({recommendations.length})
        </button>
      </div>

      {/* Search and Filters Bar (for All tab) */}
      {activeTab === "all" && (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Full-Text Search (e.g. Next.js, ML, Analytics)..."
              className="w-full pl-9 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-semibold px-2.5 py-1 rounded"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Full-Stack Development">Full-Stack Development</option>
              <option value="AI & Machine Learning">AI & Machine Learning</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="Database Engineering">Database Engineering</option>
            </select>
          </div>
        </div>
      )}

      {/* Content Rendering */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Searching PostgreSQL projects & vector embeddings...</p>
        </div>
      ) : activeTab === "all" ? (
        projects.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <p className="text-sm font-semibold text-slate-800">No projects found</p>
            <p className="text-xs text-slate-500 mt-1">Try another search keyword or select All Categories.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-900">
                      <Link
                        href={`/freelancer/projects/${p.id}`}
                        className="hover:text-indigo-600 transition"
                      >
                        {p.title}
                      </Link>
                    </h3>
                    <StatusBadge status={p.status} />
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {p.description}
                  </p>

                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {p.skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Budget: <strong className="text-slate-900">${Number(p.budget).toLocaleString()}</strong> ({p.budget_type})
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Deadline: {new Date(p.deadline).toLocaleDateString()}
                    </span>
                    <span>Client: <strong className="text-slate-700">{p.client_name}</strong></span>
                    <span>Proposals: <strong className="text-slate-700">{p.proposals_count}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 self-center md:self-start">
                  <Link
                    href={`/freelancer/projects/${p.id}`}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
                  >
                    View & Apply
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* AI Semantic Vector Recommendations Tab */
        recommendations.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <Sparkles className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No pending AI matches</p>
            <p className="text-xs text-slate-500 mt-1">
              You have already applied to matching projects, or no new projects match your skill embedding.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                Ranked using PostgreSQL pgvector cosine similarity (<code className="bg-white/80 px-1.5 py-0.5 rounded text-[11px]">&lt;=&gt;</code>) over 384-dimensional dense embeddings.
              </span>
            </div>

            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-indigo-100 p-6 shadow-xs hover:border-indigo-300 transition flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-bold text-slate-900">
                      <Link
                        href={`/freelancer/projects/${rec.id}`}
                        className="hover:text-indigo-600 transition"
                      >
                        {rec.title}
                      </Link>
                    </h3>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {rec.match_score}% Semantic Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {rec.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">{rec.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                      Budget: <strong className="text-slate-900">${Number(rec.budget).toLocaleString()}</strong>
                    </span>
                    <span>•</span>
                    <span>Client: <strong className="text-slate-700">{rec.client_name}</strong></span>
                  </div>
                </div>

                <div className="shrink-0 self-center md:self-start">
                  <Link
                    href={`/freelancer/projects/${rec.id}`}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition"
                  >
                    Submit Proposal
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

export default function FreelancerProjectsPage() {
  return (
    <DashboardShell
      allowedRole="freelancer"
      title="Browse Projects & Vector Matches"
      subtitle="Find high-impact projects matching your skills via full-text and semantic search"
    >
      <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading projects...</div>}>
        <FreelancerProjectsContent />
      </Suspense>
    </DashboardShell>
  );
}
