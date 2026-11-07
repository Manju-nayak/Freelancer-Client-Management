"use client";

import Link from "next/link";
import { useState } from "react";

const initialTasks = [
  {
    id: 1,
    title: "React Website Development",
    client: "Tech Solutions",
    deadline: "15 Nov 2026",
    budget: "₹25,000",
    progress: 65,
    status: "In Progress",
  },
  {
    id: 2,
    title: "Machine Learning Model",
    client: "Data Innovations",
    deadline: "20 Nov 2026",
    budget: "₹40,000",
    progress: 35,
    status: "In Progress",
  },
  {
    id: 3,
    title: "UI/UX Design",
    client: "Creative Studio",
    deadline: "10 Nov 2026",
    budget: "₹15,000",
    progress: 100,
    status: "Completed",
  },
];

export default function MyTasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const updateProgress = (id: number) => {
    setTasks((previous) =>
      previous.map((task) => {
        if (task.id === id && task.progress < 100) {
          const newProgress = Math.min(task.progress + 10, 100);

          return {
            ...task,
            progress: newProgress,
            status:
              newProgress === 100 ? "Completed" : "In Progress",
          };
        }

        return task;
      })
    );
  };

  const completed = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const active = tasks.filter(
    (task) => task.status === "In Progress"
  ).length;

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="bg-white border-b px-6 md:px-10 py-5 flex justify-between items-center">

        <Link href="/" className="text-2xl font-bold text-indigo-600">
          FreelanceHub.
        </Link>

        <Link
          href="/freelancer/dashboard"
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Dashboard
        </Link>

      </header>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">

        {/* TITLE */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            My Tasks
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your projects, track progress and meet deadlines.
          </p>

        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Total Tasks</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">
              {tasks.length}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              All assigned projects
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">In Progress</p>
            <h2 className="text-3xl font-bold text-orange-500 mt-2">
              {active}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Currently working
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Completed</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {completed}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Successfully delivered
            </p>
          </div>

        </div>

        {/* TASK LIST */}

        <div className="mb-6">

          <h2 className="text-xl font-bold text-gray-900">
            Assigned Projects
          </h2>

          <p className="text-gray-500 mt-1">
            Track and update your project progress.
          </p>

        </div>

        <div className="space-y-6">

          {tasks.map((task) => (

            <div
              key={task.id}
              className="bg-white rounded-xl border shadow-sm p-6"
            >

              <div className="flex flex-col md:flex-row justify-between gap-4">

                <div>

                  <h3 className="text-xl font-bold text-gray-900">
                    {task.title}
                  </h3>

                  <p className="text-gray-500 mt-2">
                    Client: {task.client}
                  </p>

                </div>

                <span
                  className={`h-fit px-4 py-2 rounded-full text-sm font-semibold ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {task.status}
                </span>

              </div>

              {/* PROJECT DETAILS */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">

                <div>
                  <p className="text-gray-500 text-sm">
                    Project Budget
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {task.budget}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Deadline
                  </p>
                  <p className="font-bold text-gray-900 mt-1">
                    {task.deadline}
                  </p>
                </div>

              </div>

              {/* PROGRESS */}

              <div className="mt-7">

                <div className="flex justify-between mb-3">

                  <p className="font-semibold text-gray-800">
                    Project Progress
                  </p>

                  <p className="font-bold text-indigo-600">
                    {task.progress}%
                  </p>

                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">

                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${task.progress}%` }}
                  />

                </div>

              </div>

              {/* UPDATE BUTTON */}

              <div className="mt-6 flex justify-end">

                <button
                  onClick={() => updateProgress(task.id)}
                  disabled={task.progress === 100}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-green-600 disabled:cursor-not-allowed transition"
                >
                  {task.progress === 100
                    ? "✓ Completed"
                    : "Update Progress +10%"}
                </button>

              </div>

            </div>

          ))}

        </div>

      </div>

    </main>
  );
}