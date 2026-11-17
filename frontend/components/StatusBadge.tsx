import React from "react";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = (status || "").toLowerCase().trim();

  let styles = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  let dotColor = "bg-slate-400";

  switch (normalized) {
    case "open":
      styles = "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60";
      dotColor = "bg-emerald-500";
      break;
    case "in-progress":
    case "in progress":
      styles = "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60";
      dotColor = "bg-blue-500";
      break;
    case "completed":
    case "accepted":
    case "approved":
    case "paid":
      styles = "bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-900/60";
      dotColor = "bg-teal-500";
      break;
    case "pending":
    case "submitted":
      styles = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60";
      dotColor = "bg-amber-500";
      break;
    case "rejected":
    case "cancelled":
    case "failed":
      styles = "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60";
      dotColor = "bg-rose-500";
      break;
    case "todo":
      styles = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      dotColor = "bg-slate-400";
      break;
    case "review":
      styles = "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/60";
      dotColor = "bg-purple-500";
      break;
    case "high":
    case "urgent":
      styles = "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60";
      dotColor = "bg-red-500";
      break;
    case "medium":
      styles = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60";
      dotColor = "bg-amber-500";
      break;
    case "low":
      styles = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      dotColor = "bg-slate-400";
      break;
  }

  // Capitalize display
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1).replace("-", " ");

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {label}
    </span>
  );
}
