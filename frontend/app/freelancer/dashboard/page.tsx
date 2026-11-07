
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function FreelancerDashboard() {
  const [user, setUser] = useState({ name: "Freelancer" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Unable to read user information");
      }
    }
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }

  const links = [
    { title: "Browse Projects", description: "Discover available freelance projects.", href: "/freelancer/projects" },
    { title: "My Proposals", description: "Track proposals submitted to clients.", href: "/freelancer/proposals" },
    { title: "My Tasks", description: "Manage your assigned tasks.", href: "/freelancer/tasks" },
    { title: "My Profile", description: "Manage your freelancer profile.", href: "/freelancer/profile" },
    { title: "Earnings", description: "View your earnings.", href: "/freelancer/earnings" },
    { title: "Reviews", description: "View your client reviews.", href: "/freelancer/reviews" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="bg-white shadow-sm px-6 py-5 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-indigo-600">
            FreelanceHub
          </h1>
          <p className="text-sm text-gray-500">
            Freelancer Dashboard
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="border border-gray-300 rounded-lg px-5 py-2 text-gray-700 hover:bg-gray-100"
        >
          Logout
        </button>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-10">

        <h2 className="text-3xl font-bold text-gray-900">
          Welcome, {user.name}!
        </h2>

        <p className="text-gray-500 mt-2">
          Manage your freelance work and discover new opportunities.
        </p>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-10">

          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-white border rounded-xl p-7 shadow-sm hover:shadow-lg transition"
            >
              <h3 className="text-xl font-bold text-gray-900">
                {item.title}
              </h3>

              <p className="text-gray-500 mt-3">
                {item.description}
              </p>

              <p className="text-indigo-600 font-semibold mt-5">
                Open →
              </p>
            </Link>
          ))}

        </div>

      </section>
    </main>
  );
}
