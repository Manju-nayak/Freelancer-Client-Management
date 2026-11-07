"use client";

import { useState } from "react";
import Link from "next/link";

type Review = {
  id: number;
  freelancer: string;
  project: string;
  rating: number;
  comment: string;
  date: string;
};

const initialReviews: Review[] = [
  {
    id: 1,
    freelancer: "Rahul Sharma",
    project: "React Website Development",
    rating: 5,
    comment: "Excellent work! Delivered the project on time with great quality.",
    date: "28 Oct 2026",
  },
  {
    id: 2,
    freelancer: "Priya Kumar",
    project: "UI/UX Dashboard Design",
    rating: 4,
    comment: "Very creative design and good communication throughout the project.",
    date: "25 Oct 2026",
  },
];

export default function ClientReviewsPage() {
  const [reviews, setReviews] = useState(initialReviews);

  const [freelancer, setFreelancer] = useState("");
  const [project, setProject] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const [message, setMessage] = useState("");

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length
      : 0;

  function submitReview(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (rating === 0) {
      setMessage("Please select a star rating.");
      return;
    }

    const newReview: Review = {
      id: Date.now(),
      freelancer,
      project,
      rating,
      comment,
      date: new Date().toLocaleDateString("en-IN"),
    };

    setReviews((previous) => [newReview, ...previous]);

    setFreelancer("");
    setProject("");
    setRating(0);
    setComment("");

    setMessage("Review submitted successfully!");

  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="bg-white border-b px-6 md:px-10 py-5 flex justify-between items-center">

        <Link href="/" className="text-2xl font-bold text-indigo-600">
          FreelanceHub.
        </Link>

        <Link
          href="/client/dashboard"
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Dashboard
        </Link>

      </header>

      <section className="max-w-6xl mx-auto px-5 md:px-10 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Reviews & Ratings
          </h1>

          <p className="text-gray-500 mt-2">
            Share your experience and appreciate freelancers for their work.
          </p>

        </div>

        {/* SUMMARY */}

        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-gray-500">Total Reviews</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-3">
              {reviews.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-gray-500">Average Rating</p>
            <h2 className="text-3xl font-bold text-yellow-500 mt-3">
              {averageRating.toFixed(1)} / 5
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl border shadow-sm">
            <p className="text-gray-500">Five Star Reviews</p>
            <h2 className="text-3xl font-bold text-green-600 mt-3">
              {reviews.filter((review) => review.rating === 5).length}
            </h2>
          </div>

        </div>

        {/* WRITE REVIEW */}

        <div className="bg-white p-7 rounded-xl border shadow-sm mb-10">

          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Write a Review
          </h2>

          <form onSubmit={submitReview} className="space-y-5">

            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Freelancer Name
              </label>

              <input
                type="text"
                required
                value={freelancer}
                onChange={(e) => setFreelancer(e.target.value)}
                placeholder="Enter freelancer name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Project Name
              </label>

              <input
                type="text"
                required
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder="Enter completed project name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            {/* STAR RATING */}

            <div>

              <label className="block font-semibold text-gray-800 mb-2">
                Rate Freelancer
              </label>

              <div className="flex gap-2">

                {[1, 2, 3, 4, 5].map((star) => (

                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition ${
                      star <= rating
                        ? "text-yellow-400"
                        : "text-gray-300"
                    }`}
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </button>

                ))}

              </div>

              <p className="text-sm text-gray-500 mt-2">
                {rating === 0
                  ? "Select a rating from 1 to 5."
                  : `You selected ${rating} out of 5 stars.`}
              </p>

            </div>

            {/* COMMENT */}

            <div>

              <label className="block font-semibold text-gray-800 mb-2">
                Your Feedback
              </label>

              <textarea
                rows={4}
                required
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience working with this freelancer..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              />

            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Submit Review →
            </button>

            {message && (
              <p className="text-sm font-semibold text-green-600">
                {message}
              </p>
            )}

          </form>

        </div>

        {/* EXISTING REVIEWS */}

        <div className="bg-white rounded-xl border shadow-sm">

          <div className="p-6 border-b">

            <h2 className="text-xl font-bold text-gray-900">
              Submitted Reviews
            </h2>

          </div>

          <div className="divide-y">

            {reviews.map((review) => (

              <div key={review.id} className="p-6">

                <div className="flex flex-wrap justify-between gap-3">

                  <div>

                    <h3 className="font-bold text-gray-900 text-lg">
                      {review.freelancer}
                    </h3>

                    <p className="text-gray-500 text-sm mt-1">
                      {review.project}
                    </p>

                  </div>

                  <span className="text-gray-400 text-sm">
                    {review.date}
                  </span>

                </div>

                <div className="text-yellow-400 text-xl mt-3">
                  {"★".repeat(review.rating)}
                  <span className="text-gray-300">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </div>

                <p className="text-gray-600 mt-3 leading-6">
                  {review.comment}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

    </main>
  );
}