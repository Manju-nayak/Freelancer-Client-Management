"use client";

import { useState } from "react";
import Link from "next/link";

export default function FreelancerProfile() {
  const [profile, setProfile] = useState({
    fullName: "Arjun Reddy",
    email: "arjun@gmail.com",
    phone: "9876543210",
    title: "Full Stack Web Developer",
    location: "Bengaluru, India",
    hourlyRate: "800",
    experience: "2 Years",
    skills: "React.js, Node.js, MongoDB, JavaScript, HTML, CSS",
    portfolio: "https://github.com/arjun",
    bio: "Passionate full-stack developer with experience in building responsive websites and web applications.",
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });

    setSaved(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/freelancer/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            My Freelancer Profile
          </h1>

          <p className="mt-2 text-gray-600">
            Manage your professional details and showcase your skills.
          </p>
        </div>

        {/* Profile Card */}
        <div className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 sm:flex-row">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-3xl font-bold text-purple-700">
              {profile.fullName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.fullName}
              </h2>

              <p className="text-gray-500">{profile.title}</p>

              <p className="mt-1 text-sm text-gray-400">
                {profile.email}
              </p>
            </div>

          </div>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl bg-white p-6 shadow-sm md:p-8"
        >

          <h2 className="mb-6 text-xl font-bold text-gray-900">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Email Address
              </label>

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={profile.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Professional Title
              </label>

              <input
                type="text"
                name="title"
                value={profile.title}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Hourly Rate (₹)
              </label>

              <input
                type="number"
                name="hourlyRate"
                value={profile.hourlyRate}
                onChange={handleChange}
                min="0"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Experience
              </label>

              <input
                type="text"
                name="experience"
                value={profile.experience}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Portfolio / GitHub Link
              </label>

              <input
                type="url"
                name="portfolio"
                value={profile.portfolio}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

          {/* Skills */}
          <div className="mt-6">
            <label className="mb-2 block font-medium text-gray-700">
              Skills
            </label>

            <textarea
              name="skills"
              value={profile.skills}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Enter your skills separated by commas"
            />
          </div>

          {/* About */}
          <div className="mt-6">
            <label className="mb-2 block font-medium text-gray-700">
              Professional Summary
            </label>

            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
              placeholder="Describe your experience and expertise..."
            />
          </div>

          {/* Save */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Save Profile
            </button>

            {saved && (
              <p className="font-medium text-green-600">
                ✓ Profile updated successfully!
              </p>
            )}

          </div>

        </form>

      </div>
    </div>
  );
}