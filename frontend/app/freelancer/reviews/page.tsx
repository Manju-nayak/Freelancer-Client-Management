"use client";

import React, { useEffect, useState } from "react";
import { Star, MessageSquare, Award } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { apiRequest } from "@/lib/api";

interface ReceivedReview {
  id: number;
  project_id: number;
  rating: number;
  comment: string;
  created_at: string;
  reviewer_name: string;
  project_title: string;
}

export default function FreelancerReviewsPage() {
  const [reviews, setReviews] = useState<ReceivedReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadReviews() {
      try {
        const res = await apiRequest<{ success: boolean; received: ReceivedReview[] }>(
          "/api/reviews/my-reviews"
        );
        setReviews(res.received || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load reviews");
      } finally {
        setLoading(false);
      }
    }
    loadReviews();
  }, []);

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : "5.0";

  return (
    <DashboardShell
      allowedRole="freelancer"
      title="Client Reviews & Testimonials"
      subtitle="Evaluations verified and aggregated in PostgreSQL database"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Rating Summary Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-amber-700">{averageRating}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Overall Client Satisfaction</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Based on {reviews.length} completed project ratings
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
            <Award className="w-4 h-4" /> Top Rated Talent
          </span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900">Verified Client Reviews</h3>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Querying client feedback from PostgreSQL...</p>
          </div>
        ) : reviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No client reviews received yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Once you complete project deliverables, clients can submit ratings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((r) => (
              <div key={r.id} className="p-6 hover:bg-slate-50/60 transition">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{r.project_title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Client: <strong className="text-slate-800">{r.reviewer_name}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-900">{r.rating}.0 / 5.0</span>
                  </div>
                </div>

                <p className="mt-3 text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-4 rounded-lg border border-slate-100 italic">
                  &ldquo;{r.comment}&rdquo;
                </p>

                <span className="text-[11px] text-slate-400 mt-2 block">
                  Reviewed on {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
