
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface ProjectsResponse {
  success: boolean;
  count: number;
  projects?: unknown[];
}

interface StoredUser {
  name?: string;
  email?: string;
  role?: string;
}

export default function ClientDashboard() {
  const [user, setUser] = useState<StoredUser>({});
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setError("Unable to read your account information.");
      }
    }

    async function fetchProjects() {
      try {
        const data = await apiRequest<ProjectsResponse>(
          "/api/projects/my-projects"
        );

        setProjectCount(data.count);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load your projects."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="flex flex-col justify-between gap-4 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center">

        <div>
          <h1 className="text-2xl font-bold text-blue-700">
            FreelanceHub
          </h1>

          <p className="text-sm text-gray-500">
            Client Dashboard
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <Link
            href="/client/dashboard"
            className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
          >
            Dashboard
          </Link>

          <Link
            href="/client/projects"
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            My Projects
          </Link>

          <Link
            href="/client/profile"
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Profile
          </Link>

          <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Client
          </span>

          <button
            onClick={handleLogout}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, {user.name || "Client"}!
          </h1>

          <p className="mt-2 text-gray-500">
            Manage your projects and collaborate with freelancers.
          </p>

        </div>

        {/* ERROR MESSAGE */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}
        <div className="grid gap-6 md:grid-cols-3">

          {/* MY PROJECTS */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-800">
              My Projects
            </h2>

            <p className="mt-2 text-gray-500">
              View and manage your posted projects.
            </p>

            <p className="mt-4 text-3xl font-bold text-indigo-600">
              {loading ? "..." : projectCount}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Projects posted
            </p>

            <Link
              href="/client/projects"
              className="mt-5 inline-block font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Projects →
            </Link>

          </div>

          {/* CREATE PROJECT */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-800">
              Post a Project
            </h2>

            <p className="mt-2 text-gray-500">
              Find the right freelancer for your work.
            </p>

            <Link
              href="/client/projects/new"
              className="mt-5 inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Create Project →
            </Link>

          </div>

          {/* PROFILE */}
          <div className="rounded-xl border bg-white p-6 shadow-sm">

            <h2 className="text-lg font-semibold text-gray-800">
              My Profile
            </h2>

            <p className="mt-2 text-gray-500">
              Manage your account information.
            </p>

            <p className="mt-4 text-sm font-medium text-gray-700">
              {user.email || "Account email"}
            </p>

            <Link
              href="/client/profile"
              className="mt-5 inline-block font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View Profile →
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
