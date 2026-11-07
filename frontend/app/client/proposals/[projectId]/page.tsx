
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { apiRequest } from "@/lib/api";

interface Proposal {
  _id: string;
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: string;
  status: "pending" | "accepted" | "rejected";
  freelancer?: {
    name: string;
    email: string;
  };
}

interface ProposalsResponse {
  success: boolean;
  count: number;
  proposals: Proposal[];
}

export default function ClientProposals() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  async function fetchProposals() {
    try {
      const data = await apiRequest<ProposalsResponse>(
        `/api/proposals/project/${projectId}`
      );

      setProposals(data.proposals);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load proposals."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (projectId) {
      fetchProposals();
    }
  }, [projectId]);

  async function updateStatus(
    proposalId: string,
    status: "accepted" | "rejected"
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to ${status} this proposal?`
    );

    if (!confirmed) return;

    setUpdatingId(proposalId);
    setError("");

    try {
      await apiRequest(
        `/api/proposals/${proposalId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        }
      );

      await fetchProposals();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to update proposal."
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="bg-white border-b px-6 py-5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            FreelanceHub
          </h1>

          <Link
            href="/client/dashboard"
            className="text-gray-600 hover:text-indigo-600"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">

        <h1 className="text-3xl font-bold text-gray-900">
          Project Proposals
        </h1>

        <p className="text-gray-500 mt-2 mb-8">
          Review freelancer applications and manage proposals.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white p-10 rounded-xl text-center">
            Loading proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center border">
            <h2 className="text-xl font-bold text-gray-800">
              No Proposals Yet
            </h2>
            <p className="text-gray-500 mt-2">
              Freelancer proposals will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">

            <p className="text-gray-600 font-medium">
              {proposals.length} proposal(s) received
            </p>

            {proposals.map((proposal) => (

              <div
                key={proposal._id}
                className="bg-white border rounded-xl p-6 shadow-sm"
              >

                <div className="flex flex-wrap justify-between gap-4">

                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {proposal.freelancer?.name || "Freelancer"}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {proposal.freelancer?.email}
                    </p>
                  </div>

                  <span
                    className={`h-fit rounded-full px-4 py-2 text-sm font-semibold ${
                      proposal.status === "accepted"
                        ? "bg-green-100 text-green-700"
                        : proposal.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {proposal.status.toUpperCase()}
                  </span>

                </div>

                <div className="grid sm:grid-cols-2 gap-5 mt-6">

                  <div>
                    <p className="text-sm text-gray-500">
                      Proposed Budget
                    </p>
                    <p className="text-xl font-bold text-indigo-600 mt-1">
                      ₹{proposal.proposedBudget.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Estimated Delivery
                    </p>
                    <p className="font-semibold text-gray-900 mt-1">
                      {proposal.estimatedDuration}
                    </p>
                  </div>

                </div>

                <div className="mt-6 border-t pt-5">
                  <h3 className="font-semibold text-gray-800 mb-2">
                    Cover Letter
                  </h3>

                  <p className="text-gray-600 leading-7 whitespace-pre-wrap">
                    {proposal.coverLetter}
                  </p>
                </div>

                {proposal.status === "pending" && (
                  <div className="flex flex-wrap gap-3 mt-6">

                    <button
                      onClick={() =>
                        updateStatus(proposal._id, "accepted")
                      }
                      disabled={updatingId === proposal._id}
                      className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                    >
                      {updatingId === proposal._id
                        ? "Updating..."
                        : "Accept Proposal"}
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(proposal._id, "rejected")
                      }
                      disabled={updatingId === proposal._id}
                      className="border border-red-300 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject Proposal
                    </button>

                  </div>
                )}

              </div>

            ))}

          </div>
        )}

      </section>
    </main>
  );
}
