"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  UserCheck, 
  CheckSquare,
  Award
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { apiRequest } from "@/lib/api";

interface ProjectDetail {
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
  freelancer_name: string | null;
  skills: string[];
  milestones: Array<{
    id: number;
    title: string;
    description: string;
    amount: number;
    due_date: string;
    status: string;
  }>;
  tasks: Array<{
    id: number;
    title: string;
    status: string;
    priority: string;
    due_date: string;
    assigned_to_name: string | null;
  }>;
  deliverables: Array<{
    id: number;
    title: string;
    file_url: string;
    status: string;
    submitted_at: string;
  }>;
  proposalsCount: number;
}

interface RecommendedFreelancer {
  freelancer_id: number;
  name: string;
  email: string;
  title: string;
  hourly_rate: number;
  experience_years: number;
  rating_avg: number;
  rating_count: number;
  match_score: string;
}

export default function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedFreelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "milestones" | "tasks" | "deliverables" | "recommendations">("overview");

  // Milestone modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState("");
  const [milestoneDesc, setMilestoneDesc] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [milestoneDueDate, setMilestoneDueDate] = useState("");
  const [milestoneSubmitting, setMilestoneSubmitting] = useState(false);

  // Task modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskPriority, setTaskPriority] = useState("medium");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  const fetchProjectData = async () => {
    try {
      const res = await apiRequest<{ success: boolean; project: ProjectDetail }>(
        `/api/projects/${projectId}`
      );
      setProject(res.project);

      // Fetch semantic vector recommendations
      const recRes = await apiRequest<{ success: boolean; recommendations: RecommendedFreelancer[] }>(
        `/api/projects/${projectId}/freelancers`
      );
      setRecommendations(recRes.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setMilestoneSubmitting(true);
    try {
      await apiRequest("/api/milestones", {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(projectId),
          title: milestoneTitle,
          description: milestoneDesc,
          amount: Number(milestoneAmount),
          dueDate: milestoneDueDate,
        }),
      });
      setIsMilestoneModalOpen(false);
      setMilestoneTitle("");
      setMilestoneDesc("");
      setMilestoneAmount("");
      fetchProjectData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating milestone");
    } finally {
      setMilestoneSubmitting(false);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setTaskSubmitting(true);
    try {
      await apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(projectId),
          title: taskTitle,
          priority: taskPriority,
          dueDate: taskDueDate,
        }),
      });
      setIsTaskModalOpen(false);
      setTaskTitle("");
      fetchProjectData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error creating task");
    } finally {
      setTaskSubmitting(false);
    }
  };

  return (
    <DashboardShell allowedRole="client">
      <div className="space-y-6">
        {/* Back Link */}
        <Link
          href="/client/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Projects
        </Link>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading project data & pgvector matches...</p>
          </div>
        ) : project ? (
          <>
            {/* Project Header Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{project.category}</p>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/client/proposals?projectId=${project.id}`}
                    className="inline-flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold px-4 py-2 rounded-lg transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Review Proposals ({project.proposalsCount})
                  </Link>
                </div>
              </div>

              {/* Key Meta */}
              <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Budget</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    ${Number(project.budget).toLocaleString()} ({project.budget_type})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Target Deadline</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Assigned Talent</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {project.freelancer_name || "Unassigned"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Experience Level</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 capitalize block">
                    {project.experience_level}
                  </span>
                </div>
              </div>

              {/* Skills Tags */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Required Skills:</span>
                {project.skills.map((s) => (
                  <span key={s} className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
              {[
                { id: "overview", label: "Overview" },
                { id: "milestones", label: `Milestones (${project.milestones.length})` },
                { id: "tasks", label: `Tasks (${project.tasks.length})` },
                { id: "deliverables", label: `Deliverables (${project.deliverables.length})` },
                { id: "recommendations", label: `AI Vector Matches (${recommendations.length})`, highlight: true },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`px-4 py-2 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600 bg-white"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                  }`}
                >
                  {tab.highlight && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB CONTENTS */}
            {activeTab === "overview" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-900">Project Description & Scope</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{project.description}</p>
              </div>
            )}

            {activeTab === "milestones" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Project Milestones</h3>
                    <p className="text-xs text-slate-400">Track phased project deliverables and payment releases</p>
                  </div>
                  <button
                    onClick={() => setIsMilestoneModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Milestone
                  </button>
                </div>

                {project.milestones.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No milestones created yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {project.milestones.map((m) => (
                      <div key={m.id} className="py-4 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                            <StatusBadge status={m.status} />
                          </div>
                          {m.description && <p className="text-xs text-slate-500 mt-1">{m.description}</p>}
                          {m.due_date && (
                            <span className="text-[11px] text-slate-400 mt-1 block">
                              Due: {new Date(m.due_date).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-slate-900">${Number(m.amount).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "tasks" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Project Tasks</h3>
                    <p className="text-xs text-slate-400">Collaborative task progress and assignments</p>
                  </div>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Task
                  </button>
                </div>

                {project.tasks.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No tasks defined yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {project.tasks.map((t) => (
                      <div key={t.id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <CheckSquare className="w-4 h-4 text-slate-400" />
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{t.title}</p>
                            <span className="text-[10px] text-slate-400">
                              Priority: <strong className="capitalize">{t.priority}</strong> | Assigned: {t.assigned_to_name || "Unassigned"}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "deliverables" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Submitted Deliverables</h3>
                  <p className="text-xs text-slate-400">Code repositories, prototypes, and asset files</p>
                </div>

                {project.deliverables.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">No deliverables submitted by freelancer yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {project.deliverables.map((d) => (
                      <div key={d.id} className="py-4 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-900">{d.title}</p>
                          <a
                            href={d.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-indigo-600 hover:underline mt-0.5 block"
                          >
                            {d.file_url}
                          </a>
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "recommendations" && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Semantic Vector Matching (PostgreSQL pgvector)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    These professionals were semantically ranked using cosine similarity (&lt;=&gt;) over 384-dimensional embeddings comparing your project brief against verified freelancer talent profiles.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.freelancer_id}
                      className="p-5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:shadow-xs transition"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{rec.name}</h4>
                          <p className="text-xs text-slate-600 font-medium">{rec.title}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                          {rec.match_score}% Match
                        </span>
                      </div>

                      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                        <span>Rate: <strong className="text-slate-800">${rec.hourly_rate}/hr</strong></span>
                        <span>Experience: <strong className="text-slate-800">{rec.experience_years} yrs</strong></span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <strong className="text-slate-800">{rec.rating_avg}</strong> ({rec.rating_count} reviews)
                        </span>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex justify-end">
                        <Link
                          href={`/client/proposals?projectId=${project.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View Proposals &rarr;
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>

      {/* ADD MILESTONE MODAL */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title="Add Project Milestone"
        description="Define milestone deliverables, target due date, and escrow funding."
      >
        <form onSubmit={handleAddMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Frontend Architecture & Design System"
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($)</label>
            <input
              type="number"
              min="1"
              required
              placeholder="1500"
              value={milestoneAmount}
              onChange={(e) => setMilestoneAmount(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date</label>
            <input
              type="date"
              value={milestoneDueDate}
              onChange={(e) => setMilestoneDueDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Scope Details</label>
            <textarea
              rows={3}
              placeholder="Provide acceptance criteria..."
              value={milestoneDesc}
              onChange={(e) => setMilestoneDesc(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsMilestoneModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={milestoneSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              {milestoneSubmitting ? "Adding..." : "Add Milestone"}
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD TASK MODAL */}
      <Modal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        title="Add Project Task"
        description="Create a task item for progress tracking."
      >
        <form onSubmit={handleAddTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Implement pgvector cosine query in backend"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
            <select
              value={taskPriority}
              onChange={(e) => setTaskPriority(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Date</label>
            <input
              type="date"
              value={taskDueDate}
              onChange={(e) => setTaskDueDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={taskSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
            >
              {taskSubmitting ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
