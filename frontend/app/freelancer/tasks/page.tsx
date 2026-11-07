
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Freelancer {
  _id: string;
  name: string;
  email: string;
}

interface Proposal {
  _id: string;
  freelancer: Freelancer;
  status: string;
}

function TaskAssignmentContent() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [assignedTo, setAssignedTo] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [priority, setPriority] = useState("medium");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProposals() {
      try {
        const response = await apiRequest<{
          proposals: Proposal[];
        }>(`/api/proposals/project/${projectId}`);

        const accepted = (response.proposals || []).filter(
          (proposal) => proposal.status === "accepted"
        );

        setProposals(accepted);

        if (accepted.length > 0) {
          setAssignedTo(accepted[0].freelancer._id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load proposals"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProposals();
  }, [projectId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!assignedTo) {
      setError("Please select a freelancer.");
      return;
    }

    setSubmitting(true);

    try {
      await apiRequest("/api/tasks", {
        method: "POST",
        body: JSON.stringify({
          projectId,
          assignedTo,
          title,
          description,
          deadline,
          priority,
        }),
      });

      setMessage("Task assigned successfully!");
      setTitle("");
      setDescription("");
      setDeadline("");
      setPriority("medium");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to assign task"
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="p-8">Loading accepted proposals...</p>;
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900">
          Assign Tasks
        </h1>
        <p className="mt-2 text-gray-600">
          Assign work to a freelancer whose proposal you accepted.
        </p>

        {error && (
          <p className="mt-5 rounded-lg bg-red-100 p-4 text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-5 rounded-lg bg-green-100 p-4 text-green-700">
            {message}
          </p>
        )}

        {proposals.length === 0 ? (
          <div className="mt-8 rounded-xl bg-white p-6 shadow">
            <p className="text-gray-700">
              No accepted proposals found for this project.
            </p>
            <Link
              href="/client/projects"
              className="mt-4 inline-block text-blue-600 hover:underline"
            >
              Back to My Projects
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 rounded-xl bg-white p-6 shadow"
          >
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Select Freelancer
              </label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                {proposals.map((proposal) => (
                  <option
                    key={proposal._id}
                    value={proposal.freelancer._id}
                  >
                    {proposal.freelancer.name} ({proposal.freelancer.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Task Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g. Design the homepage"
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Task Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe the work to be completed..."
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 p-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-3"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Assigning..." : "Assign Task"}
            </button>
          </form>
        )}

        <Link
          href="/client/projects"
          className="mt-6 inline-block text-blue-600 hover:underline"
        >
          ← Back to My Projects
        </Link>
      </div>
    </main>
  );
}

export default function TaskAssignmentPage() {
  return (
    <Suspense fallback={<p className="p-8">Loading task assignment...</p>}>
      <TaskAssignmentContent />
    </Suspense>
  );
}
