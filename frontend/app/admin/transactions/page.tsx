"use client";

import React, { useEffect, useState } from "react";
import { CreditCard, DollarSign, Search, ShieldCheck } from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import { apiRequest } from "@/lib/api";

interface TransactionItem {
  payment_id: number;
  transaction_reference: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  project_title: string;
  client_name: string;
  freelancer_name: string;
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [totalVolume, setTotalVolume] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransactions() {
      try {
        const res = await apiRequest<{ success: boolean; totalVolume: number; transactions: TransactionItem[] }>(
          "/api/admin/transactions"
        );
        setTransactions(res.transactions || []);
        setTotalVolume(res.totalVolume || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    }
    loadTransactions();
  }, []);

  return (
    <DashboardShell
      allowedRole="admin"
      title="Platform Transaction Ledger"
      subtitle="Complete financial transaction log populated by payment ACID transactions"
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Header Volume Banner */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs mb-6 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Gross Settled Volume
          </span>
          <span className="text-2xl font-bold text-slate-900 mt-0.5 block">
            ${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-4 h-4" />
          ACID Consistency Verified
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Querying platform transaction ledger...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">No transactions recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Project</th>
                  <th className="px-6 py-3.5">Payer (Client)</th>
                  <th className="px-6 py-3.5">Payee (Freelancer)</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((t) => (
                  <tr key={t.payment_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                      {t.transaction_reference}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{t.project_title}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{t.client_name}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium">{t.freelancer_name}</td>
                    <td className="px-6 py-4 text-slate-600">{t.payment_method}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={t.status} />
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
