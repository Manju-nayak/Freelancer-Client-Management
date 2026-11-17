"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, CheckCircle2, CreditCard, ShieldCheck, Download } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import MetricCard from "@/components/MetricCard";
import { apiRequest } from "@/lib/api";

interface EarningRecord {
  payment_id: number;
  transaction_reference: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  project_title: string;
  client_name: string;
  milestone_title: string | null;
}

export default function FreelancerEarningsPage() {
  const [earnings, setEarnings] = useState<EarningRecord[]>([]);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await apiRequest<{ success: boolean; totalEarned: number; earnings: EarningRecord[] }>(
          "/api/payments/freelancer"
        );
        setEarnings(res.earnings || []);
        setTotalEarned(res.totalEarned || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load earnings records");
      } finally {
        setLoading(false);
      }
    }
    loadEarnings();
  }, []);

  return (
    <DashboardShell
      allowedRole="freelancer"
      title="Earnings & Payout Ledger"
      subtitle="Audited transaction history from PostgreSQL view_payment_summaries"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Total Net Earnings"
          value={`$${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
          subtitle="Processed & deposited to your account"
          icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
          trend="Audited"
          trendPositive={true}
        />
        <MetricCard
          title="Completed Payouts"
          value={earnings.filter((e) => e.status === "completed").length}
          subtitle="All transactions cleared via ACID guarantees"
          icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />}
        />
        <MetricCard
          title="Escrow Protection"
          value="Active"
          subtitle="Automated milestone disbursements"
          icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
        />
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Transaction History</h3>
            <p className="text-xs text-slate-400">Chronological disbursements from clients</p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Querying earnings ledger...</p>
          </div>
        ) : earnings.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No earnings recorded yet</p>
            <p className="text-xs text-slate-500 mt-1">
              Complete project deliverables and receive milestone releases from clients.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Client</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Disbursed Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {earnings.map((e) => (
                  <tr key={e.payment_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                      {e.transaction_reference}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{e.project_title}</p>
                      {e.milestone_title && (
                        <p className="text-[11px] text-slate-400">Milestone: {e.milestone_title}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {e.client_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {e.payment_method}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(e.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${Number(e.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={e.status} />
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
