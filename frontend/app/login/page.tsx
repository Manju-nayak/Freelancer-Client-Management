"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, FormEvent } from "react";
import { apiRequest } from "@/lib/api";
import { Sparkles, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "client" | "freelancer" | "admin";
  };
}

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>("/api/auth/login", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "client") {
        router.push("/client/dashboard");
      } else if (data.user.role === "freelancer") {
        router.push("/freelancer/dashboard");
      } else if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        setError("Unsupported account role.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const fillDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <main
      className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 relative transition-colors duration-150"
      suppressHydrationWarning
    >
      {/* Top Controls */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div
        className="bg-white dark:bg-slate-900 w-full max-w-md p-8 md:p-10 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 transition-colors"
        suppressHydrationWarning
      >
        {/* Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              F
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-xl tracking-tight">
              FreelanceHub
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Sign In to Platform</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">PostgreSQL + pgvector Project Management</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" suppressHydrationWarning>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. client@acmecorp.com"
              required
              suppressHydrationWarning
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Password
              </label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              suppressHydrationWarning
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            suppressHydrationWarning
            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-3 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Verifying Credentials..." : "Sign In"}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Panel */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-center mb-3">
            Quick Demo Sign-In
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => fillDemoAccount("client@acmecorp.com", "client123")}
              className="p-2.5 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-900/50 font-semibold text-left transition cursor-pointer"
            >
              <span className="block text-[10px] text-blue-500 dark:text-blue-400 uppercase font-bold">Client</span>
              Sarah (Acme)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => fillDemoAccount("freelancer@dev.com", "freelancer123")}
              className="p-2.5 rounded-lg bg-emerald-50/80 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900/50 font-semibold text-left transition cursor-pointer"
            >
              <span className="block text-[10px] text-emerald-500 dark:text-emerald-400 uppercase font-bold">Freelancer</span>
              Alex (Full-Stack)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => fillDemoAccount("david@ml.com", "freelancer123")}
              className="p-2.5 rounded-lg bg-indigo-50/80 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-900/50 font-semibold text-left transition cursor-pointer"
            >
              <span className="block text-[10px] text-indigo-500 dark:text-indigo-400 uppercase font-bold">AI Specialist</span>
              David (pgvector)
            </button>
            <button
              type="button"
              suppressHydrationWarning
              onClick={() => fillDemoAccount("admin@freelancehub.com", "admin123")}
              className="p-2.5 rounded-lg bg-purple-50/80 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-900/50 font-semibold text-left transition cursor-pointer"
            >
              <span className="block text-[10px] text-purple-500 dark:text-purple-400 uppercase font-bold">Admin</span>
              System Monitor
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </main>
  );
}
