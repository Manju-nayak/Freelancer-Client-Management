"use client";

import React, { useEffect, useState } from "react";
import { History, ShieldCheck, Activity } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import { apiRequest } from "@/lib/api";

interface AuditLogItem {
  id: number;
  entity_type: string;
  entity_id: number;
  action: string;
  details: string;
  created_at: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await apiRequest<{ success: boolean; logs: AuditLogItem[] }>(
          "/api/admin/audit-logs"
        );
        setLogs(res.logs || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <DashboardShell
      allowedRole="admin"
      title="System Audit Trail"
      subtitle="Immutable event logs recorded by PostgreSQL database triggers and transactions"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database Trigger Audit Log</h3>
            <p className="text-xs text-slate-400">Captured via trg_audit_project_status and stored procedures</p>
          </div>
          <Activity className="w-4 h-4 text-slate-400" />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Querying PostgreSQL audit logs...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No audit events recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Log ID</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Entity</th>
                  <th className="px-6 py-3.5">Action Trigger</th>
                  <th className="px-6 py-3.5">Event Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-400">#{log.id}</td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
                        {log.entity_type} #{log.entity_id}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 leading-relaxed font-mono text-[11px]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
