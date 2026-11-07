"use client";

import { useState } from "react";
import Link from "next/link";

const initialPayments = [
  {
    id: "PAY001",
    project: "React Website Development",
    freelancer: "Rahul Sharma",
    amount: 15000,
    date: "31 Oct 2026",
    status: "Completed",
    method: "UPI",
  },
  {
    id: "PAY002",
    project: "UI/UX Dashboard Design",
    freelancer: "Priya Kumar",
    amount: 8000,
    date: "28 Oct 2026",
    status: "Pending",
    method: "Bank Transfer",
  },
  {
    id: "PAY003",
    project: "E-commerce Website",
    freelancer: "Arjun Reddy",
    amount: 12000,
    date: "25 Oct 2026",
    status: "Completed",
    method: "Credit Card",
  },
  {
    id: "PAY004",
    project: "Portfolio Website",
    freelancer: "Sneha Patel",
    amount: 5000,
    date: "20 Oct 2026",
    status: "Failed",
    method: "UPI",
  },
];

export default function ClientPayments() {
  const [payments, setPayments] = useState(initialPayments);
  const [filter, setFilter] = useState("All");

  const completedPayments = payments
    .filter((payment) => payment.status === "Completed")
    .reduce((total, payment) => total + payment.amount, 0);

  const pendingPayments = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((total, payment) => total + payment.amount, 0);

  const filteredPayments =
    filter === "All"
      ? payments
      : payments.filter((payment) => payment.status === filter);

  const downloadReceipt = (payment: (typeof payments)[number]) => {
    const receipt = `
FREELANCEHUB - PAYMENT RECEIPT

Payment ID: ${payment.id}
Project: ${payment.project}
Freelancer: ${payment.freelancer}
Amount: Rs. ${payment.amount.toLocaleString("en-IN")}
Date: ${payment.date}
Payment Method: ${payment.method}
Status: ${payment.status}

Thank you for using FreelanceHub!
`;

    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${payment.id}-receipt.txt`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/client/dashboard"
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>

          <h1 className="mt-4 text-3xl font-bold text-gray-900">
            Payments & Transactions
          </h1>

          <p className="mt-2 text-gray-600">
            Track your project payments and transaction history.
          </p>
        </div>

        {/* Payment Summary */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Total Payments</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-900">
              ₹
              {payments
                .reduce((total, payment) => total + payment.amount, 0)
                .toLocaleString("en-IN")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              All recorded transactions
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Completed Payments</p>
            <h2 className="mt-2 text-3xl font-bold text-green-600">
              ₹{completedPayments.toLocaleString("en-IN")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Successfully completed transactions
            </p>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-gray-500">Pending Payments</p>
            <h2 className="mt-2 text-3xl font-bold text-orange-500">
              ₹{pendingPayments.toLocaleString("en-IN")}
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Payments awaiting completion
            </p>
          </div>

        </div>

        {/* Transaction History */}
        <div className="overflow-hidden rounded-xl bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-4 border-b p-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Transaction History
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your project transactions.
              </p>
            </div>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 outline-none focus:border-blue-500"
            >
              <option value="All">All Payments</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[750px] text-left">

              <thead className="bg-gray-50 text-sm text-gray-500">
                <tr>
                  <th className="px-6 py-4">Payment ID</th>
                  <th className="px-6 py-4">Project</th>
                  <th className="px-6 py-4">Freelancer</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Receipt</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">

                    <td className="px-6 py-5 font-medium text-blue-600">
                      {payment.id}
                    </td>

                    <td className="px-6 py-5 text-gray-800">
                      {payment.project}
                    </td>

                    <td className="px-6 py-5 text-gray-600">
                      {payment.freelancer}
                    </td>

                    <td className="px-6 py-5 font-semibold text-gray-900">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-6 py-5 text-gray-500">
                      {payment.date}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          payment.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : payment.status === "Pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <button
                        onClick={() => downloadReceipt(payment)}
                        className="text-sm font-medium text-blue-600 hover:underline"
                      >
                        Download
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>
            </table>

            {filteredPayments.length === 0 && (
              <p className="p-8 text-center text-gray-500">
                No transactions found.
              </p>
            )}
          </div>

          <div className="border-t p-5 text-sm text-gray-500">
            Showing {filteredPayments.length} transactions
          </div>

        </div>

      </div>
    </div>
  );
}