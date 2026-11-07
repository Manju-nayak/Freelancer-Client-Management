"use client";

import { useState } from "react";
import Link from "next/link";

const projects = [
  {
    id: 1,
    title: "React Website Development",
    category: "Web Development",
    description: "Build a modern, responsive business website using React and Tailwind CSS.",
    budget: "₹25,000",
    deadline: "15 Nov 2026",
    skills: ["React", "CSS", "JavaScript"],
    type: "Fixed Price",
  },
  {
    id: 2,
    title: "Machine Learning Model",
    category: "AI & Machine Learning",
    description: "Develop a machine learning model for customer prediction and data analysis.",
    budget: "₹40,000",
    deadline: "20 Nov 2026",
    skills: ["Python", "Machine Learning", "Pandas"],
    type: "Fixed Price",
  },
  {
    id: 3,
    title: "Mobile Application Design",
    category: "Mobile Development",
    description: "Design and develop a modern mobile application with a clean user interface.",
    budget: "₹35,000",
    deadline: "25 Nov 2026",
    skills: ["Flutter", "Dart", "Firebase"],
    type: "Fixed Price",
  },
  {
    id: 4,
    title: "UI/UX Dashboard Design",
    category: "UI/UX Design",
    description: "Create an attractive dashboard design for a project management application.",
    budget: "₹15,000",
    deadline: "10 Dec 2026",
    skills: ["Figma", "UI Design", "UX"],
    type: "Fixed Price",
  },
  {
    id: 5,
    title: "Node.js Backend Development",
    category: "Web Development",
    description: "Develop REST APIs and database integration for an e-commerce application.",
    budget: "₹30,000",
    deadline: "18 Nov 2026",
    skills: ["Node.js", "Express", "MongoDB"],
    type: "Hourly",
  },
  {
    id: 6,
    title: "Python Data Analysis",
    category: "Data Science",
    description: "Analyze business datasets and generate meaningful visualizations and reports.",
    budget: "₹20,000",
    deadline: "30 Nov 2026",
    skills: ["Python", "SQL", "Power BI"],
    type: "Fixed Price",
  },
];

export default function BrowseProjects() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.skills.some((skill) =>
        skill.toLowerCase().includes(search.toLowerCase())
      );

    const matchesCategory =
      category === "All Categories" || project.category === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}
      <header className="bg-white border-b px-6 md:px-10 py-5 flex justify-between items-center">

        <Link href="/freelancer/dashboard"
          className="text-2xl font-bold text-indigo-600">
          FreelanceHub.
        </Link>

        <Link href="/freelancer/dashboard"
          className="text-gray-600 hover:text-indigo-600 font-medium">
          ← Dashboard
        </Link>

      </header>

      <section className="max-w-7xl mx-auto px-6 py-10">

        {/* TITLE */}
        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            Browse Projects
          </h1>

          <p className="text-gray-500 mt-2">
            Discover opportunities and find projects that match your skills.
          </p>

        </div>

        {/* SEARCH AND FILTER */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">

          <div className="grid md:grid-cols-2 gap-5">

            <div>

              <label className="block text-gray-800 font-semibold mb-2">
                Search Projects
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by project title or skills..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

            </div>

            <div>

              <label className="block text-gray-800 font-semibold mb-2">
                Project Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >

                <option>All Categories</option>
                <option>Web Development</option>
                <option>AI & Machine Learning</option>
                <option>Mobile Development</option>
                <option>UI/UX Design</option>
                <option>Data Science</option>

              </select>

            </div>

          </div>

        </div>

        {/* PROJECT COUNT */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-bold text-gray-900">
            Available Projects ({filteredProjects.length})
          </h2>

          <span className="text-sm text-gray-500">
            Latest opportunities
          </span>

        </div>

        {/* PROJECT CARDS */}
        <div className="grid md:grid-cols-2 gap-6">

          {filteredProjects.map((project) => (

            <div
              key={project.id}
              className="bg-white rounded-xl border shadow-sm p-6 hover:shadow-lg transition"
            >

              <div className="flex justify-between items-start gap-3 mb-4">

                <div>

                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {project.category}
                  </span>

                  <h3 className="text-xl font-bold text-gray-900 mt-4">
                    {project.title}
                  </h3>

                </div>

                <span className="text-green-600 font-semibold text-sm whitespace-nowrap">
                  Open
                </span>

              </div>

              <p className="text-gray-600 text-sm leading-6 mb-5">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">

                {project.skills.map((skill) => (

                  <span
                    key={skill}
                    className="bg-slate-100 text-gray-700 text-xs px-3 py-2 rounded-md"
                  >
                    {skill}
                  </span>

                ))}

              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-5">

                <div>

                  <p className="text-gray-500 text-sm">
                    Budget
                  </p>

                  <p className="font-bold text-gray-900 mt-1">
                    {project.budget}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500 text-sm">
                    Deadline
                  </p>

                  <p className="font-semibold text-gray-900 mt-1">
                    {project.deadline}
                  </p>

                </div>

              </div>

              <div className="flex justify-between items-center mt-6">

                <span className="text-sm text-gray-500">
                  {project.type}
                </span>

                <Link
                  href={`/freelancer/projects/${project.id}`}
                  className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  View & Apply →
                </Link>

              </div>

            </div>

          ))}

        </div>

        {/* NO RESULTS */}
        {filteredProjects.length === 0 && (

          <div className="bg-white p-12 rounded-xl text-center border">

            <h3 className="text-xl font-bold text-gray-800">
              No Projects Found
            </h3>

            <p className="text-gray-500 mt-2">
              Try changing your search or category filter.
            </p>

          </div>

        )}

      </section>

    </main>
  );
}