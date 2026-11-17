"use client";

import React, { useEffect, useState } from "react";
import { CheckSquare, Clock, Calendar, CheckCircle2, ChevronRight, AlertCircle } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface FreelancerTask {
  id: number;
  project_id: number;
  project_title: string;
  milestone_title: string | null;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  due_date: string | null;
  created_at: string;
}

export default function FreelancerTasksPage() {
  const [tasks, setTasks] = useState<FreelancerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchTasks = async () => {
    try {
      const res = await apiRequest<{ success: boolean; tasks: FreelancerTask[] }>("/api/tasks/my-tasks");
      setTasks(res.tasks || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    setUpdatingId(taskId);
    try {
      await apiRequest(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error updating task status");
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = tasks.filter((t) => {
    if (filter === "All") return true;
    return t.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <DashboardShell
      allowedRole="freelancer"
      title="Assigned Tasks"
      subtitle="Track and update your deliverables across active assigned projects"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {["All", "todo", "in-progress", "review", "completed"].map((st) => (
          <button
            key={st}
            onClick={() => setFilter(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filter.toLowerCase() === st.toLowerCase()
                ? "bg-slate-900 text-white font-semibold"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {st.replace("-", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Querying tasks from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No tasks found</p>
          <p className="text-xs text-slate-500 mt-1">
            Once a client assigns you to a project, project tasks will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-bold text-slate-900">{task.title}</h3>
                  <StatusBadge status={task.status} />
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {task.priority} Priority
                  </span>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-600 leading-relaxed">{task.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-slate-500">
                  <span>Project: <strong className="text-slate-800">{task.project_title}</strong></span>
                  {task.milestone_title && (
                    <span>• Milestone: <strong className="text-slate-700">{task.milestone_title}</strong></span>
                  )}
                  {task.due_date && (
                    <span>• Due: {new Date(task.due_date).toLocaleDateString()}</span>
                  )}
                </div>
              </div>

              {/* Status Update Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <label className="text-xs text-slate-400 font-medium">Update Status:</label>
                <select
                  value={task.status}
                  disabled={updatingId === task.id}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Under Review</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
