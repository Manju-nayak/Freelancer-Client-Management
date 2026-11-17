"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderGit2,
  FileText,
  CreditCard,
  Star,
  User,
  Search,
  CheckSquare,
  ShieldCheck,
  Users,
  Database,
  History,
  LogOut,
  Sparkles
} from "lucide-react";
import { logout } from "@/lib/api";

interface SidebarProps {
  role: "client" | "freelancer" | "admin";
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();

  const clientLinks = [
    { title: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
    { title: "My Projects", href: "/client/projects", icon: FolderGit2 },
    { title: "Proposals", href: "/client/proposals", icon: FileText },
    { title: "Payments", href: "/client/payments", icon: CreditCard },
    { title: "Reviews", href: "/client/reviews", icon: Star },
    { title: "Company Profile", href: "/client/profile", icon: User },
  ];

  const freelancerLinks = [
    { title: "Dashboard", href: "/freelancer/dashboard", icon: LayoutDashboard },
    { title: "Browse Projects", href: "/freelancer/projects", icon: Search },
    { title: "My Proposals", href: "/freelancer/proposals", icon: FileText },
    { title: "My Tasks", href: "/freelancer/tasks", icon: CheckSquare },
    { title: "Earnings", href: "/freelancer/earnings", icon: CreditCard },
    { title: "Client Reviews", href: "/freelancer/reviews", icon: Star },
    { title: "Profile & Skills", href: "/freelancer/profile", icon: User },
  ];

  const adminLinks = [
    { title: "Platform Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Users Management", href: "/admin/users", icon: Users },
    { title: "Projects Monitor", href: "/admin/projects", icon: FolderGit2 },
    { title: "Transactions", href: "/admin/transactions", icon: CreditCard },
    { title: "System Audit Logs", href: "/admin/audit-logs", icon: History },
    { title: "SQL Query Console", href: "/admin/db-explorer", icon: Database },
  ];

  const links =
    role === "client"
      ? clientLinks
      : role === "freelancer"
      ? freelancerLinks
      : adminLinks;

  const roleColors = {
    client: "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
    freelancer: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60",
    admin: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60",
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 min-h-screen transition-colors duration-150">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            F
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-lg tracking-tight">FreelanceHub</span>
        </Link>
        <span
          className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${roleColors[role]}`}
        >
          {role}
        </span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-5 px-3 space-y-1">
        <p className="px-3 pb-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || (link.href !== `/${role}/dashboard` && pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon
                className={`w-4 h-4 transition-colors ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                }`}
              />
              <span>{link.title}</span>
            </Link>
          );
        })}
      </div>

      {/* User Profile Card & Sign Out */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{userName || "User"}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{userEmail || "user@platform.com"}</p>
          </div>
          <button
            onClick={logout}
            title="Log Out"
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
