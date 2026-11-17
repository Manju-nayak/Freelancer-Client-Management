"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquare, Plus, CheckCircle2, UserCheck, ShieldCheck } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import Modal from "@/components/Modal";
import { apiRequest } from "@/lib/api";

interface ReviewItem {
  id: number;
  project_id: number;
  reviewer_id: number;
  reviewee_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name?: string;
  reviewee_name?: string;
  project_title: string;
}

interface AssignedProject {
  project_id: number;
  title: string;
  freelancer_id: number | null;
  freelancer_name: string | null;
}

export default function ClientReviewsPage() {
  const [givenReviews, setGivenReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<AssignedProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fetchReviews = async () => {
    try {
      const res = await apiRequest<{ success: boolean; received: ReviewItem[]; given: ReviewItem[] }>(
        "/api/reviews/my-reviews"
      );
      setGivenReviews(res.given || []);

      // Fetch projects with assigned freelancers
      const pRes = await apiRequest<{ projects: AssignedProject[] }>("/api/projects/my-projects");
      const assigned = (pRes.projects || []).filter((p) => p.freelancer_id !== null);
      setProjects(assigned);
      if (assigned.length > 0 && !selectedProjectId) {
        setSelectedProjectId(String(assigned[0].project_id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const selectedProject = projects.find((p) => String(p.project_id) === selectedProjectId);
      if (!selectedProject || !selectedProject.freelancer_id) {
        throw new Error("Please select a project with an assigned freelancer.");
      }

      await apiRequest("/api/reviews", {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(selectedProjectId),
          revieweeId: selectedProject.freelancer_id,
          rating,
          comment,
        }),
      });

      setSuccessMsg("Review submitted successfully! Database trigger recalculated freelancer ratings.");
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMsg("");
        setComment("");
        fetchReviews();
      }, 1200);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error submitting review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardShell
      allowedRole="client"
      title="Performance Feedback & Reviews"
      subtitle="Evaluations verified and managed via PostgreSQL trigger trg_review_update_rating"
      actionButton={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Leave Freelancer Review
        </button>
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
          <p className="text-xs text-slate-500">Retrieving reviews from database...</p>
        </div>
      ) : givenReviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-800">No reviews submitted yet</p>
          <p className="text-xs text-slate-500 mt-1">
            Provide rating and performance feedback once your assigned freelancers finish milestones.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {givenReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs hover:border-slate-300 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{rev.project_title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reviewed Freelancer: <strong className="text-slate-800">{rev.reviewee_name}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-900">{rev.rating}.0 / 5.0</span>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100 italic">
                &ldquo;{rev.comment}&rdquo;
              </p>

              <div className="mt-3 text-[11px] text-slate-400">
                Submitted on {new Date(rev.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LEAVE REVIEW MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Leave Freelancer Rating & Feedback"
        description="Submitting updates the database reviews table and automatically recomputes the freelancer's rating via trigger."
      >
        {successMsg && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {projects.length === 0 ? (
                <option value="">No projects with assigned freelancers available</option>
              ) : (
                projects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.title} (Freelancer: {p.freelancer_name})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setRating(s)}
                  className={`p-2 rounded-lg border transition ${
                    rating >= s
                      ? "bg-amber-50 border-amber-300 text-amber-500"
                      : "bg-slate-50 border-slate-200 text-slate-300"
                  }`}
                >
                  <Star className={`w-5 h-5 ${rating >= s ? "fill-amber-500" : ""}`} />
                </button>
              ))}
              <span className="text-xs font-bold text-slate-700 ml-2">{rating} Stars</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Comment</label>
            <textarea
              required
              rows={4}
              placeholder="Detail the freelancer's performance, code quality, communication, and delivery..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
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
              disabled={submitting || projects.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
