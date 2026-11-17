"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Send, 
  Building, 
  ShieldCheck,
  AlertCircle
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
  client_email: string;
  company_name: string | null;
  skills: string[];
}

export default function FreelancerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = use(params);
  const projectId = unwrappedParams.id;
  const router = useRouter();

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedBudget, setProposedBudget] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("3 weeks");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await apiRequest<{ success: boolean; project: ProjectDetail }>(
          `/api/projects/${projectId}`
        );
        setProject(res.project);
        setProposedBudget(String(res.project.budget));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load project details");
      } finally {
        setLoading(false);
      }
    }
    loadProject();
  }, [projectId]);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      await apiRequest("/api/proposals", {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(projectId),
          coverLetter,
          proposedBudget: Number(proposedBudget),
          estimatedDuration,
        }),
      });

      setFormSuccess("Proposal submitted successfully to client!");
      setTimeout(() => {
        setIsModalOpen(false);
        router.push("/freelancer/proposals");
      }, 1200);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error submitting proposal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell allowedRole="freelancer">
      <div className="max-w-4xl space-y-6">
        <Link
          href="/freelancer/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Available Projects
        </Link>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading project details...</p>
          </div>
        ) : project ? (
          <>
            {/* Project Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900">{project.title}</h2>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{project.category}</p>
                </div>

                {project.status === "open" ? (
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Proposal
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-semibold px-3 py-1.5 bg-slate-100 rounded-lg">
                    Project Closed for Proposals
                  </span>
                )}
              </div>

              {/* Scope & Description */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Project Description & Specifications
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {project.description}
                </p>
              </div>

              {/* Required Skills */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Required Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.skills.map((s) => (
                    <span
                      key={s}
                      className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Project Meta Details */}
              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Client Budget</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    ${Number(project.budget).toLocaleString()} ({project.budget_type})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Project Deadline</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block">
                    {new Date(project.deadline).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Experience Level</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 capitalize block">
                    {project.experience_level}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Client Organization</span>
                  <span className="text-base font-bold text-slate-900 mt-0.5 block truncate">
                    {project.company_name || project.client_name}
                  </span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* SUBMIT PROPOSAL MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Submit Project Proposal"
        description="Detail your approach, delivery schedule, and proposed commercial terms."
        maxWidth="max-w-2xl"
      >
        {formSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {formSuccess}
          </div>
        )}
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmitProposal} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Proposed Budget ($)</label>
              <input
                type="number"
                min="1"
                required
                value={proposedBudget}
                onChange={(e) => setProposedBudget(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Timeline</label>
              <input
                type="text"
                required
                placeholder="e.g. 3 weeks"
                value={estimatedDuration}
                onChange={(e) => setEstimatedDuration(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Cover Letter & Technical Approach
            </label>
            <textarea
              required
              rows={6}
              placeholder="Explain why you are the best fit for this project, relevant past experience, and your proposed architecture..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-5 py-2 rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Send Proposal"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
