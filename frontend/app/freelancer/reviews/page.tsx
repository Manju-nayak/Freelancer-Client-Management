"use client";

import { useState } from "react";
import Link from "next/link";

const reviews = [
  {
    client: "Rahul Sharma",
    project: "React Website Development",
    rating: 5,
    comment: "Excellent work! Delivered the project on time with great quality.",
    date: "31 Oct 2026",
  },
  {
    client: "Priya Kumar",
    project: "UI/UX Dashboard Design",
    rating: 4,
    comment: "Good communication and creative design. Satisfied with the work.",
    date: "28 Oct 2026",
  },
  {
    client: "Arjun Reddy",
    project: "E-commerce Website",
    rating: 5,
    comment: "Very professional and completed all requirements perfectly.",
    date: "25 Oct 2026",
  },
];

export default function FreelancerReviews() {
  const [selectedRating, setSelectedRating] = useState("All");

  const averageRating =
    reviews.reduce((total, review) => total + review.rating, 0) /
    reviews.length;

  const filteredReviews =
    selectedRating === "All"
      ? reviews
      : reviews.filter(
          (review) => review.rating === Number(selectedRating)
        );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <Link
            href="/freelancer/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            My Reviews & Ratings
          </h1>

          <p className="mt-2 text-gray-600">
            View feedback and ratings received from your clients.
          </p>
        </div>

        {/* Rating Summary */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Average Rating</p>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              {averageRating.toFixed(1)} / 5
            </h2>
            <p className="mt-2 text-xl text-yellow-400">★★★★★</p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Total Reviews</p>
            <h2 className="mt-2 text-4xl font-bold text-gray-900">
              {reviews.length}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Reviews received from clients
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Positive Reviews</p>
            <h2 className="mt-2 text-4xl font-bold text-green-600">
              {reviews.filter((review) => review.rating >= 4).length}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Ratings of 4 stars and above
            </p>
          </div>

        </div>

        {/* Reviews List */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold text-gray-900">
              Client Feedback
            </h2>

            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          {filteredReviews.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No reviews found for this rating.
            </div>
          ) : (
            filteredReviews.map((review, index) => (
              <div
                key={index}
                className="border-b p-6 last:border-b-0"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.client}
                  </h3>

                  <span className="text-sm text-gray-400">
                    {review.date}
                  </span>
                </div>

                <p className="mt-1 text-gray-500">
                  {review.project}
                </p>

                <div className="mt-3 text-xl text-yellow-400">
                  {"★".repeat(review.rating)}
                  <span className="text-gray-300">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </div>

                <p className="mt-3 text-gray-700">
                  {review.comment}
                </p>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  );
}