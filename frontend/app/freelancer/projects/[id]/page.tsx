
"use client";

import { useParams } from "next/navigation";
import { useEffect, useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Project {
  _id: string;
  title: string;
  category: string;
  description: string;
  budget: number;
  budgetType: string;
  deadline: string;
  skillsRequired: string[];
  client?: {
    name: string;
    email: string;
  };
}

interface ProjectResponse {
  success: boolean;
  project: Project;
}

interface ProposalResponse {
  success: boolean;
  message: string;
}

function ProjectDetailsContent()  {
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [proposalError, setProposalError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [proposal, setProposal] = useState({
    amount: "",
    deliveryDays: "",
    coverLetter: "",
  });

  useEffect(() => {
    async function fetchProject() {
      try {
        const data = await apiRequest<ProjectResponse>(
          `/api/projects/${projectId}`
        );

        setProject(data.project);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load project."
        );
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setProposalError("");
    setSubmitting(true);

    try {
      const data = await apiRequest<ProposalResponse>(
        "/api/proposals",
        {
          method: "POST",
          body: JSON.stringify({
            projectId,
            proposedBudget: Number(proposal.amount),
            estimatedDuration: `${proposal.deliveryDays} days`,
            coverLetter: proposal.coverLetter,
          }),
        }
      );

      setSubmitted(true);
    } catch (err) {
      setProposalError(
        err instanceof Error
          ? err.message
          : "Failed to submit proposal."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-gray-600">Loading project details...</p>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Project Not Found
          </h1>

          <p className="text-gray-500 mt-3">
            {error || "This project does not exist."}
          </p>

          <Link
            href="/freelancer/projects"
            className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg"
          >
            Back to Projects
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b px-6 md:px-10 py-5 flex justify-between items-center">
        <Link
          href="/freelancer/dashboard"
          className="text-2xl font-bold text-indigo-600"
        >
          FreelanceHub.
        </Link>

        <Link
          href="/freelancer/projects"
          className="text-gray-600 hover:text-indigo-600 font-medium"
        >
          ← Browse Projects
        </Link>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Project Details
          </h1>

          <p className="text-gray-500 mt-2">
            Review project requirements and submit your proposal.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* PROJECT INFORMATION */}
          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white p-7 rounded-xl shadow-sm border">

              <span className="bg-indigo-50 text-indigo-600 px-3 py-2 rounded-full text-sm font-semibold">
                {project.category}
              </span>

              <h2 className="text-2xl font-bold text-gray-900 mt-5">
                {project.title}
              </h2>

              <p className="text-gray-600 leading-7 mt-5">
                {project.description}
              </p>

              <p className="text-gray-500 mt-4">
                Posted by: {project.client?.name || "Client"}
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mt-8 border-t pt-6">

                <div>
                  <p className="text-gray-500 text-sm">
                    Project Budget
                  </p>

                  <h3 className="text-2xl font-bold text-green-600 mt-2">
                    ₹{project.budget.toLocaleString("en-IN")}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {project.budgetType === "fixed"
                      ? "Fixed Price"
                      : "Hourly"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Project Deadline
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mt-2">
                    {project.deadline.slice(0, 10)}
                  </h3>
                </div>

              </div>
            </div>

            {/* REQUIRED SKILLS */}
            <div className="bg-white p-7 rounded-xl shadow-sm border">

              <h3 className="text-xl font-bold text-gray-900 mb-5">
                Required Skills
              </h3>

              <div className="flex flex-wrap gap-3">
                {project.skillsRequired.map((skill) => (
                  <span
                    key={skill}
                    className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>

            </div>
          </div>

          {/* PROPOSAL FORM */}
          <div className="bg-white p-7 rounded-xl shadow-sm border h-fit">

            {submitted ? (
              <div className="text-center py-8">

                <div className="text-5xl mb-5">
                  ✅
                </div>

                <h2 className="text-2xl font-bold text-green-600">
                  Proposal Submitted!
                </h2>

                <p className="text-gray-500 mt-3">
                  Your proposal has been saved successfully.
                </p>

                <Link
                  href="/freelancer/proposals"
                  className="block bg-indigo-600 text-white py-3 rounded-lg mt-7 font-semibold hover:bg-indigo-700"
                >
                  View My Proposals
                </Link>

              </div>
            ) : (

              <>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Submit Your Proposal
                </h2>

                <p className="text-gray-500 text-sm mb-7">
                  Send your offer to the client.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                  <div>
                    <label className="block font-semibold text-gray-800 mb-2">
                      Your Bid Amount (₹)
                    </label>

                    <input
                      type="number"
                      min="1"
                      required
                      value={proposal.amount}
                      onChange={(e) =>
                        setProposal({
                          ...proposal,
                          amount: e.target.value,
                        })
                      }
                      placeholder="Enter your proposed amount"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-2">
                      Delivery Time (Days)
                    </label>

                    <input
                      type="number"
                      min="1"
                      required
                      value={proposal.deliveryDays}
                      onChange={(e) =>
                        setProposal({
                          ...proposal,
                          deliveryDays: e.target.value,
                        })
                      }
                      placeholder="Example: 15"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-gray-800 mb-2">
                      Cover Letter
                    </label>

                    <textarea
                      required
                      rows={6}
                      value={proposal.coverLetter}
                      onChange={(e) =>
                        setProposal({
                          ...proposal,
                          coverLetter: e.target.value,
                        })
                      }
                      placeholder="Explain why you are suitable for this project..."
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>

                  {proposalError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                      {proposalError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition"
                  >
                    {submitting
                      ? "Submitting..."
                      : "Submit Proposal"}
                  </button>

                </form>
              </>
            )}

          </div>
        </div>
      </section>
    </main>
  );
}


