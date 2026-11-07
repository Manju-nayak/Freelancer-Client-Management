
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  description: string;
  category?: string;
  budget: number;
  budgetType: string;
  status: string;
  deadline?: string;
}

export default function ClientProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await apiRequest<{ projects: Project[] }>(
          "/api/projects/my-projects"
        );
        setProjects(response.projects || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load projects");
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="mt-2 text-gray-600">
              Manage your projects and review freelancer proposals.
            </p>
          </div>

          <Link
            href="/client/projects/new"
            className="rounded-lg bg-blue-600 px-5 py-3 text-white"
          >
            + Post New Project
          </Link>
        </div>

        {loading && <p>Loading your projects...</p>}

        {error && (
          <p className="rounded-lg bg-red-100 p-4 text-red-700">{error}</p>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <h2 className="text-xl font-semibold">No projects posted yet</h2>
            <p className="mt-2 text-gray-600">
              Create your first project to start receiving proposals.
            </p>
            <Link
              href="/client/projects/new"
              className="mt-5 inline-block rounded-lg bg-blue-600 px-5 py-3 text-white"
            >
              Create Project
            </Link>
          </div>
        )}

        <div className="space-y-5">
          {projects.map((project) => (
            <div
              key={project._id}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{project.title}</h2>
                  <p className="mt-2 text-gray-600">{project.description}</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700">
                  {project.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-600">
                <span>
                  Budget: ₹{project.budget} ({project.budgetType})
                </span>
                {project.category && <span>Category: {project.category}</span>}
                {project.deadline && (
                  <span>
                    Deadline: {new Date(project.deadline).toLocaleDateString()}
                  </span>
                )}
              </div>

              <Link
                href={`/client/proposals/${project._id}`}
                className="mt-6 inline-block rounded-lg bg-green-600 px-5 py-2.5 text-white hover:bg-green-700"
              >
                View Proposals
              </Link>
            </div>
          ))}
        </div>

        <Link
          href="/client/dashboard"
          className="mt-8 inline-block text-blue-600 hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
