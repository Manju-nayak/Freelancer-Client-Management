"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

const projects = [
  {
    id: 1,
    title: "React Website Development",
    category: "Web Development",
    description:
      "Build a modern, responsive business website using React and Tailwind CSS. The website should include a homepage, about page, services section and contact form.",
    budget: "₹25,000",
    deadline: "15 Nov 2026",
    skills: ["React", "CSS", "JavaScript"],
  },
  {
    id: 2,
    title: "Machine Learning Model",
    category: "AI & Machine Learning",
    description:
      "Develop a machine learning model for customer prediction and data analysis. The freelancer should perform data preprocessing, model training and evaluation.",
    budget: "₹40,000",
    deadline: "20 Nov 2026",
    skills: ["Python", "Machine Learning", "Pandas"],
  },
  {
    id: 3,
    title: "Mobile Application Design",
    category: "Mobile Development",
    description:
      "Design and develop a modern mobile application with an attractive user interface and smooth navigation.",
    budget: "₹35,000",
    deadline: "25 Nov 2026",
    skills: ["Flutter", "Dart", "Firebase"],
  },
  {
    id: 4,
    title: "UI/UX Dashboard Design",
    category: "UI/UX Design",
    description:
      "Create an attractive dashboard design for a project management application using modern design principles.",
    budget: "₹15,000",
    deadline: "10 Dec 2026",
    skills: ["Figma", "UI Design", "UX"],
  },
  {
    id: 5,
    title: "Node.js Backend Development",
    category: "Web Development",
    description:
      "Develop REST APIs and database integration for an e-commerce application.",
    budget: "₹30,000",
    deadline: "18 Nov 2026",
    skills: ["Node.js", "Express", "MongoDB"],
  },
  {
    id: 6,
    title: "Python Data Analysis",
    category: "Data Science",
    description:
      "Analyze business datasets and generate meaningful visualizations and reports.",
    budget: "₹20,000",
    deadline: "30 Nov 2026",
    skills: ["Python", "SQL", "Power BI"],
  },
];

export default function ProjectDetails() {

  const params = useParams();
  const router = useRouter();

  const projectId = Number(params.id);

  const project = projects.find((p) => p.id === projectId);

  const [proposal, setProposal] = useState({
    amount: "",
    deliveryDays: "",
    coverLetter: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (
      !proposal.amount ||
      !proposal.deliveryDays ||
      !proposal.coverLetter.trim()
    ) {
      alert("Please complete all fields.");
      return;
    }

    setSubmitted(true);
  };

  if (!project) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-xl shadow text-center">

          <h1 className="text-2xl font-bold text-gray-900">
            Project Not Found
          </h1>

          <p className="text-gray-500 mt-3">
            This project does not exist.
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

        {/* PAGE TITLE */}
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

              <div className="grid sm:grid-cols-2 gap-6 mt-8 border-t pt-6">

                <div>
                  <p className="text-gray-500 text-sm">
                    Project Budget
                  </p>

                  <h3 className="text-2xl font-bold text-green-600 mt-2">
                    {project.budget}
                  </h3>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Project Deadline
                  </p>

                  <h3 className="text-lg font-bold text-gray-900 mt-2">
                    {project.deadline}
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

                {project.skills.map((skill) => (

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
                  Your proposal has been submitted successfully.
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

                  {/* BID AMOUNT */}
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


                  {/* DELIVERY TIME */}
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


                  {/* COVER LETTER */}
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />

                  </div>


                  {/* SUBMIT */}
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 transition"
                  >
                    Submit Proposal →
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