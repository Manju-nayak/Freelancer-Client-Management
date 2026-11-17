"use client";

import React, { useEffect, useState } from "react";
import { 
  CreditCard, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import DashboardShell from "@/components/DashboardShell";
import StatusBadge from "@/components/StatusBadge";
import MetricCard from "@/components/MetricCard";
import Modal from "@/components/Modal";
import { apiRequest } from "@/lib/api";

interface PaymentRecord {
  payment_id: number;
  transaction_reference: string;
  amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  project_id: number;
  project_title: string;
  freelancer_id: number;
  freelancer_name: string;
  milestone_title: string | null;
}

interface ClientProjectsResponse {
  projects: Array<{
    project_id: number;
    title: string;
    freelancer_id: number | null;
    freelancer_name: string | null;
  }>;
}

export default function ClientPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [totalSpent, setTotalSpent] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Payment Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientProjects, setClientProjects] = useState<Array<{ project_id: number; title: string; freelancer_id: number | null; freelancer_name: string | null }>>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [paymentAmount, setPaymentAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const fetchPayments = async () => {
    try {
      const res = await apiRequest<{ success: boolean; totalSpent: number; payments: PaymentRecord[] }>(
        "/api/payments/client"
      );
      setPayments(res.payments || []);
      setTotalSpent(res.totalSpent || 0);

      // Fetch projects for payment modal
      const projRes = await apiRequest<ClientProjectsResponse>("/api/projects/my-projects");
      const assignedProjects = (projRes.projects || []).filter((p) => p.freelancer_id !== null);
      setClientProjects(assignedProjects);
      if (assignedProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(String(assignedProjects[0].project_id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load payment records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleProcessPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFormSuccess("");

    try {
      const selectedProject = clientProjects.find((p) => String(p.project_id) === selectedProjectId);
      if (!selectedProject || !selectedProject.freelancer_id) {
        throw new Error("Please select an active project with an assigned freelancer.");
      }

      await apiRequest("/api/payments", {
        method: "POST",
        body: JSON.stringify({
          projectId: Number(selectedProjectId),
          freelancerId: selectedProject.freelancer_id,
          amount: Number(paymentAmount),
          paymentMethod,
        }),
      });

      setFormSuccess("Payment executed successfully via PostgreSQL ACID transaction!");
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess("");
        setPaymentAmount("");
        fetchPayments();
      }, 1200);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Error executing transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filterStatus === "All") return true;
    return p.status.toLowerCase() === filterStatus.toLowerCase();
  });

  return (
    <DashboardShell
      allowedRole="client"
      title="Payments & Invoices"
      subtitle="Complete transaction ledger query from PostgreSQL view_payment_summaries"
      actionButton={
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition"
        >
          <Plus className="w-3.5 h-3.5" />
          Release Escrow / Payment
        </button>
      }
    >
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Total Capital Deployed"
          value={`$${totalSpent.toLocaleString()}`}
          subtitle="All completed transactions"
          icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
          trend="Audited"
          trendPositive={true}
        />
        <MetricCard
          title="Completed Transactions"
          value={payments.filter((p) => p.status === "completed").length}
          subtitle="Processed via ACID transactions"
          icon={<CheckCircle2 className="w-4 h-4 text-teal-600" />}
        />
        <MetricCard
          title="Security & Escrow"
          value="100% Protected"
          subtitle="PostgreSQL transactional integrity"
          icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-4">
        {["All", "completed", "pending"].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              filterStatus.toLowerCase() === st.toLowerCase()
                ? "bg-slate-900 text-white font-semibold"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-500">Querying payment ledger...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No payment transactions found</p>
            <p className="text-xs text-slate-500 mt-1">
              Released payments for project milestones will be recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Project & Scope</th>
                  <th className="px-6 py-3.5">Freelancer</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => (
                  <tr key={p.payment_id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4 font-mono font-bold text-indigo-700">
                      {p.transaction_reference}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{p.project_title}</p>
                      {p.milestone_title && (
                        <p className="text-[11px] text-slate-400">Milestone: {p.milestone_title}</p>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {p.freelancer_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {p.payment_method}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${Number(p.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PROCESS PAYMENT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Release Milestone Payment"
        description="Processes payment using a PostgreSQL multi-table ACID transaction."
      >
        {formSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {formSuccess}
          </div>
        )}
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg">
            {formError}
          </div>
        )}

        <form onSubmit={handleProcessPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              required
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {clientProjects.length === 0 ? (
                <option value="">No assigned projects available for payment</option>
              ) : (
                clientProjects.map((p) => (
                  <option key={p.project_id} value={p.project_id}>
                    {p.title} (Freelancer: {p.freelancer_name})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($)</label>
              <input
                type="number"
                min="1"
                required
                placeholder="1500"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
              >
                <option value="UPI">UPI</option>
                <option value="Escrow">Escrow</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || clientProjects.length === 0}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm disabled:opacity-50"
            >
              {submitting ? "Processing Transaction..." : "Confirm & Pay"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardShell>
  );
}
