"use client";

import React, { useEffect, useState } from "react";
import { User, DollarSign, Clock, Globe, Sparkles, CheckCircle2 } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { apiRequest } from "@/lib/api";

interface FreelancerProfileData {
  user: {
    id: number;
    name: string;
    email: string;
    bio: string;
    profile: {
      title: string;
      hourly_rate: number;
      experience_years: number;
      portfolio_url: string;
      rating_avg: number;
      rating_count: number;
      total_earnings: number;
    };
    skills: Array<{ id: number; name: string }>;
  };
}

export default function FreelancerProfilePage() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [title, setTitle] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [totalEarnings, setTotalEarnings] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await apiRequest<FreelancerProfileData>("/api/auth/me");
        setName(res.user.name || "");
        setBio(res.user.bio || "");
        if (res.user.profile) {
          setTitle(res.user.profile.title || "");
          setHourlyRate(String(res.user.profile.hourly_rate || ""));
          setExperienceYears(String(res.user.profile.experience_years || ""));
          setPortfolioUrl(res.user.profile.portfolio_url || "");
          setTotalEarnings(res.user.profile.total_earnings || 0);
        }
        if (res.user.skills) {
          setSkillsInput(res.user.skills.map((s) => s.name).join(", "));
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await apiRequest("/api/profiles", {
        method: "PUT",
        body: JSON.stringify({
          name,
          bio,
          title,
          hourlyRate: Number(hourlyRate),
          experienceYears: Number(experienceYears),
          portfolioUrl,
          skills: skillsArray,
        }),
      });

      // Update local storage
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const u = JSON.parse(userStr);
        u.name = name;
        localStorage.setItem("user", JSON.stringify(u));
      }

      setMessage({
        text: "Profile updated successfully! PostgreSQL pgvector 384-d semantic embedding regenerated.",
        type: "success",
      });
    } catch (err) {
      setMessage({
        text: err instanceof Error ? err.message : "Error saving profile",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardShell
      allowedRole="freelancer"
      title="Profile & Professional Credentials"
      subtitle="Updating skills and experience triggers automatic pgvector embedding recalculation"
    >
      <div className="max-w-3xl space-y-6">
        {message && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Loading profile data...</p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Professional Title / Specialization
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Full-Stack & Cloud Architect"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hourly Rate ($ / hr)</label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Years of Experience</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0"
                    required
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Technical Skills & Tools (comma separated)
              </label>
              <input
                type="text"
                required
                placeholder="React, Next.js, Node.js, PostgreSQL, pgvector, Docker, AWS"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                These skills are converted into 384-d semantic vectors used to match you with client projects.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Portfolio or GitHub URL</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  placeholder="https://github.com/yourhandle"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Professional Bio & Value Proposition
              </label>
              <textarea
                rows={4}
                placeholder="Highlight your engineering accomplishments, architectural experience, and problem-solving expertise..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-900 font-semibold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Vector Embedding Generator Active</span>
              </div>
              <span className="text-xs text-slate-600 font-medium">
                Lifetime Earnings: <strong>${Number(totalEarnings).toLocaleString()}</strong>
              </span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-6 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50"
              >
                {saving ? "Regenerating Vectors & Saving..." : "Update Profile & Embeddings"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardShell>
  );
}
