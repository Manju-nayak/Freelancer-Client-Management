"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Calendar, DollarSign, Users, ChevronRight, CheckCircle2 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { apiRequest } from "@/lib/api";

interface ProjectSummary {
  project_id: number;
  title: string;
  category: string;
  budget: number;
  budget_type: string;
  deadline: string;
  status: string;
  freelancer_name: string | null;
  total_proposals: number;
  total_tasks: number;
  completed_tasks: number;
  task_progress_pct: string;
  total_paid: number;
  created_at: string;
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Full-Stack Development",
    budget: "",
    budgetType: "fixed",
    deadline: "",
    experienceLevel: "intermediate",
    description: "",
    skillsRequired: "React, Next.js, PostgreSQL",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await apiRequest<{ success: boolean; projects: ProjectSummary[] }>(
        "/api/projects/my-projects"
      );
      setProjects(res.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const skillsArray = formData.skillsRequired
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          budget: Number(formData.budget),
          budgetType: formData.budgetType,
          deadline: formData.deadline,
          experienceLevel: formData.experienceLevel,
          description: formData.description,
          skillsRequired: skillsArray,
        }),
      });

      setFormSuccess("Project created successfully with 384-dimensional pgvector embedding!");
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess("");
        fetchProjects();
      }, 1200);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error creating project");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = filterStatus === "All" || p.status.toLowerCase() === filterStatus.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardShell
      allowedRole="client"
      title="My Projects"
      subtitle="Manage your posted project briefs, milestones, and deliverables"
      actionButton={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Create New Project
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by title or category..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {["All", "open", "in-progress", "completed"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
                filterStatus.toLowerCase() === st.toLowerCase()
                  ? "bg-slate-900 text-white font-semibold"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/70"
              }`}
            >
              {st === "open" ? "Open for Bids" : st.replace("-", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Querying database project records...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <p className="text-sm font-semibold text-slate-800">No projects match your filter</p>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search terms or create a new project brief.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProjects.map((p) => (
            <div
              key={p.project_id}
              className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    <Link
                      href={`/client/projects/${p.project_id}`}
                      className="hover:text-indigo-600 transition"
                    >
                      {p.title}
                    </Link>
                  </h3>
                  <StatusBadge status={p.status} />
                </div>

                <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">{p.category}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <strong>${Number(p.budget).toLocaleString()}</strong> ({p.budget_type})
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Deadline: {new Date(p.deadline).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    Proposals: <strong className="text-slate-800">{p.total_proposals}</strong>
                  </span>
                </div>

                {p.freelancer_name && (
                  <p className="mt-2 text-xs text-indigo-700 bg-indigo-50/80 px-2.5 py-1 rounded-md inline-block">
                    Assigned Freelancer: <strong>{p.freelancer_name}</strong>
                  </p>
                )}

                {/* Task progress bar */}
                <div className="mt-4 flex items-center gap-3 max-w-md">
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full"
                      style={{ width: `${Math.min(100, Number(p.task_progress_pct))}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 shrink-0">
                    {p.completed_tasks}/{p.total_tasks} Tasks ({p.task_progress_pct}%)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/client/projects/${p.project_id}`}
                  className="inline-flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-4 py-2 rounded-lg transition"
                >
                  Project Details
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
                {p.total_proposals > 0 && (
                  <Link
                    href={`/client/proposals?projectId=${p.project_id}`}
                    className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold px-3 py-2 rounded-lg transition"
                  >
                    Proposals ({p.total_proposals})
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create & Publish Project Brief"
        description="Fill out the requirements. Our system will generate 384-d vector embeddings for semantic matching."
        maxWidth="max-w-2xl"
      >
        {formSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {formSuccess}
          </div>
        )}
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
            {formError}
          </div>
        )}

        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Enterprise Financial Analytics Dashboard"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="Full-Stack Development">Full-Stack Development</option>
                <option value="Frontend Development">Frontend Development</option>
                <option value="Backend Development">Backend Development</option>
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Mobile App Development">Mobile App Development</option>
                <option value="Database Engineering">Database Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                value={formData.experienceLevel}
                onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate Level</option>
                <option value="expert">Expert Level</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget ($)</label>
              <input
                type="number"
                min="1"
                required
                placeholder="e.g. 4500"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Budget Type</label>
              <select
                value={formData.budgetType}
                onChange={(e) => setFormData({ ...formData, budgetType: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              >
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Deadline</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              required
              placeholder="React, Next.js, TypeScript, PostgreSQL, pgvector"
              value={formData.skillsRequired}
              onChange={(e) => setFormData({ ...formData, skillsRequired: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Scope & Description</label>
            <textarea
              required
              rows={4}
              placeholder="Describe deliverables, requirements, architecture, and expectations..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
            >
              {submitting ? "Embedding & Publishing..." : "Publish Project"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
