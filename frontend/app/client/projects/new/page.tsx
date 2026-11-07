"use client";

import Link from "next/link";
import { useState } from "react";

export default function NewProject() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skills = [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "Python",
    "Java",
    "MongoDB",
    "MySQL",
    "Machine Learning",
    "UI/UX Design",
  ];

  function toggleSkill(skill: string) {
    setSelectedSkills((previous) =>
      previous.includes(skill)
        ? previous.filter((item) => item !== skill)
        : [...previous, skill]
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    alert("Project submitted successfully! Database integration will be added later.");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8">

        <Link
          href="/client/dashboard"
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Back to Dashboard
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Post a New Project
        </h1>

        <p className="text-gray-500 mt-2">
          Describe your project and find the right freelancer.
        </p>

      </div>

      {/* PROJECT FORM */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-10">

        <form onSubmit={handleSubmit} className="space-y-7">

          {/* PROJECT TITLE */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              Project Title
            </label>

            <input
              type="text"
              placeholder="Example: Website Development"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              Project Description
            </label>

            <textarea
              rows={5}
              placeholder="Explain your project requirements..."
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              Project Category
            </label>

            <select
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-800"
            >
              <option value="" disabled>
                Select Category
              </option>

              <option>Web Development</option>
              <option>Mobile App Development</option>
              <option>Machine Learning</option>
              <option>Data Science</option>
              <option>UI/UX Design</option>
              <option>Software Development</option>
            </select>
          </div>

          {/* REQUIRED SKILLS */}
          <div>
            <label className="block font-semibold text-gray-800 mb-3">
              Required Skills
            </label>

            <div className="flex flex-wrap gap-3">
              {skills.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition ${
                    selectedSkills.includes(skill)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-indigo-500"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>

            <p className="text-sm text-gray-500 mt-3">
              Selected Skills: {selectedSkills.length}
            </p>
          </div>

          {/* BUDGET AND DEADLINE */}
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Project Budget (₹)
              </label>

              <input
                type="number"
                min="1"
                placeholder="Example: 25000"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-2">
                Project Deadline
              </label>

              <input
                type="date"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

          </div>

          {/* PROJECT TYPE */}
          <div>
            <label className="block font-semibold text-gray-800 mb-2">
              Project Type
            </label>

            <select
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-800"
            >
              <option value="" disabled>
                Select Project Type
              </option>

              <option>Fixed Price</option>
              <option>Hourly</option>
            </select>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex flex-wrap gap-4 pt-4">

            <button
              type="submit"
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition shadow-md"
            >
              Publish Project
            </button>

            <Link
              href="/client/dashboard"
              className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Cancel
            </Link>

          </div>

        </form>

      </div>

    </main>
  );
}