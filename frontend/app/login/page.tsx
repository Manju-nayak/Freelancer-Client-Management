
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, FormEvent } from "react";
import { apiRequest } from "@/lib/api";

interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: "client" | "freelancer";
  };
}

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>(
        "/api/auth/login",
        {
          method: "POST",
          auth: false,
          body: JSON.stringify({ email, password }),
        }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "client") {
        router.push("/client/dashboard");
      } else if (data.user.role === "freelancer") {
        router.push("/freelancer/dashboard");
      } else {
        setError("Unsupported account role.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Login failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-10">
      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">

        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-indigo-600">
            FreelanceHub.
          </Link>

          <h1 className="text-3xl font-bold mt-7 text-gray-900">
            Welcome Back!
          </h1>

          <p className="text-gray-500 mt-3">
            Login to continue your freelancing journey.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">

          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {error}
            </p>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="accent-indigo-600" />
              Remember me
            </label>

            <span className="text-gray-400">
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-60 transition duration-200 shadow-md shadow-indigo-100"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-center text-gray-600 mt-8">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-600 font-semibold hover:text-indigo-800"
          >
            Create Account
          </Link>
        </p>

        <div className="text-center mt-7 text-xs text-gray-400">
          Secure Login | FreelanceHub
        </div>

      </div>
    </main>
  );
}
