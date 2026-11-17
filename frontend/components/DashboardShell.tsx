"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import { getCurrentUser } from "@/lib/api";

interface DashboardShellProps {
  children: React.ReactNode;
  allowedRole?: "client" | "freelancer" | "admin";
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
}

export default function DashboardShell({
  children,
  allowedRole,
  title,
  subtitle,
  actionButton,
}: DashboardShellProps) {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: "client" | "freelancer" | "admin";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }

    if (allowedRole && currentUser.role !== allowedRole && currentUser.role !== "admin") {
      router.push(`/${currentUser.role}/dashboard`);
      return;
    }

    setUser(currentUser);
    setLoading(false);
  }, [allowedRole, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Authenticating session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-150">
      {/* Sidebar */}
      <Sidebar role={user.role} userName={user.name} userEmail={user.email} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0 transition-colors">
          <div>
            {title ? (
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{title}</h1>
                {subtitle && <span className="text-xs text-slate-400 dark:text-slate-600">|</span>}
                {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
              </div>
            ) : (
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Project Management Console
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {actionButton}
            <ThemeToggle />
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium capitalize">
                Postgres Active
              </span>
            </div>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}
