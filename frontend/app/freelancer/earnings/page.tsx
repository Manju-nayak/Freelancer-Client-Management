"use client";

import Link from "next/link";

const transactions = [
  {
    id: 1,
    project: "React Website Development",
    client: "Tech Solutions",
    amount: 25000,
    date: "28 Oct 2026",
    status: "Paid",
  },
  {
    id: 2,
    project: "Machine Learning Model",
    client: "Data Innovations",
    amount: 40000,
    date: "27 Oct 2026",
    status: "Pending",
  },
  {
    id: 3,
    project: "UI/UX Design",
    client: "Creative Studio",
    amount: 15000,
    date: "25 Oct 2026",
    status: "Paid",
  },
  {
    id: 4,
    project: "Portfolio Website",
    client: "Digital Agency",
    amount: 12000,
    date: "20 Oct 2026",
    status: "Processing",
  },
];

export default function EarningsPage() {
  const totalEarnings = transactions
    .filter((item) => item.status === "Paid")
    .reduce((total, item) => total + item.amount, 0);

  const pendingPayments = transactions
    .filter((item) => item.status === "Pending")
    .reduce((total, item) => total + item.amount, 0);

  const completedPayments = transactions.filter(
    (item) => item.status === "Paid"
  ).length;

  const downloadInvoice = (transaction: (typeof transactions)[number]) => {
    const invoice = `
FREELANCEHUB
PAYMENT INVOICE

Invoice ID: FH-${transaction.id}00${transaction.id}
Project: ${transaction.project}
Client: ${transaction.client}
Amount: Rs. ${transaction.amount.toLocaleString("en-IN")}
Date: ${transaction.date}
Payment Status: ${transaction.status}

Thank you for using FreelanceHub!
    `;

    const blob = new Blob([invoice], {
      type: "text/plain",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `Invoice-FH-${transaction.id}.txt`;

    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50">

      {/* HEADER */}

      <header className="bg-white border-b px-6 md:px-10 py-5 flex justify-between items-center">

        <Link
          href="/"
          className="text-2xl font-bold text-indigo-600"
        >
          FreelanceHub.
        </Link>

        <Link
          href="/freelancer/dashboard"
          className="text-indigo-600 font-semibold hover:text-indigo-800"
        >
          ← Dashboard
        </Link>

      </header>

      <div className="max-w-7xl mx-auto px-5 md:px-10 py-10">

        {/* PAGE TITLE */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            My Earnings
          </h1>

          <p className="text-gray-500 mt-2">
            Track your income, monitor payments and manage transactions.
          </p>

        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

          {/* TOTAL EARNINGS */}

          <div className="bg-white p-6 rounded-xl shadow-sm border">

            <div className="flex justify-between items-center">

              <p className="text-gray-500 font-medium">
                Total Earnings
              </p>

              <span className="text-2xl">💰</span>

            </div>

            <h2 className="text-3xl font-bold text-green-600 mt-4">
              ₹{totalEarnings.toLocaleString("en-IN")}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Successfully received
            </p>

          </div>

          {/* PENDING PAYMENTS */}

          <div className="bg-white p-6 rounded-xl shadow-sm border">

            <div className="flex justify-between items-center">

              <p className="text-gray-500 font-medium">
                Pending Payments
              </p>

              <span className="text-2xl">⏳</span>

            </div>

            <h2 className="text-3xl font-bold text-orange-500 mt-4">
              ₹{pendingPayments.toLocaleString("en-IN")}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Waiting for payment
            </p>

          </div>

          {/* COMPLETED PAYMENTS */}

          <div className="bg-white p-6 rounded-xl shadow-sm border">

            <div className="flex justify-between items-center">

              <p className="text-gray-500 font-medium">
                Completed Payments
              </p>

              <span className="text-2xl">✅</span>

            </div>

            <h2 className="text-3xl font-bold text-indigo-600 mt-4">
              {completedPayments}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Successfully completed transactions
            </p>

          </div>

        </div>

        {/* EARNINGS OVERVIEW */}

        <div className="bg-white rounded-xl border shadow-sm p-6 mb-10">

          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Earnings Overview
          </h2>

          <div className="flex flex-col md:flex-row justify-between gap-6">

            <div>
              <p className="text-gray-500 text-sm">
                Total Amount Received
              </p>

              <p className="text-2xl font-bold text-green-600 mt-2">
                ₹{totalEarnings.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Awaiting Payment
              </p>

              <p className="text-2xl font-bold text-orange-500 mt-2">
                ₹{pendingPayments.toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-gray-500 text-sm">
                Total Transactions
              </p>

              <p className="text-2xl font-bold text-indigo-600 mt-2">
                {transactions.length}
              </p>
            </div>

          </div>

        </div>

        {/* TRANSACTION HISTORY */}

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">

          <div className="p-6 border-b">

            <h2 className="text-xl font-bold text-gray-900">
              Transaction History
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              View your project payments and download invoices.
            </p>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50">

                <tr className="text-gray-600 text-sm">

                  <th className="p-5">Project</th>
                  <th className="p-5">Client</th>
                  <th className="p-5">Amount</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Status</th>
                  <th className="p-5">Invoice</th>

                </tr>

              </thead>

              <tbody>

                {transactions.map((transaction) => (

                  <tr
                    key={transaction.id}
                    className="border-t hover:bg-slate-50 transition"
                  >

                    <td className="p-5 font-semibold text-gray-900">
                      {transaction.project}
                    </td>

                    <td className="p-5 text-gray-600">
                      {transaction.client}
                    </td>

                    <td className="p-5 font-bold text-gray-900">
                      ₹{transaction.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="p-5 text-gray-600">
                      {transaction.date}
                    </td>

                    <td className="p-5">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          transaction.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : transaction.status === "Pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {transaction.status}
                      </span>

                    </td>

                    <td className="p-5">

                      <button
                        onClick={() => downloadInvoice(transaction)}
                        className="text-indigo-600 font-semibold hover:text-indigo-800"
                      >
                        ↓ Download
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* FOOTER */}

        <div className="text-center text-gray-400 text-sm mt-10">
          FreelanceHub | Secure Payment Management
        </div>

      </div>

    </main>
  );
}