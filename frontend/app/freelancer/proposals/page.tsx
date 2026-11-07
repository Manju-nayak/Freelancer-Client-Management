import Link from "next/link";

const proposals = [
  {
    id: 1,
    title: "React Website Development",
    client: "Tech Solutions",
    budget: "₹25,000",
    submitted: "28 Oct 2026",
    status: "Pending",
  },
  {
    id: 2,
    title: "Machine Learning Model",
    client: "Data Innovations",
    budget: "₹40,000",
    submitted: "27 Oct 2026",
    status: "Accepted",
  },
  {
    id: 3,
    title: "UI/UX Design",
    client: "Creative Studio",
    budget: "₹15,000",
    submitted: "27 Oct 2026",
    status: "Rejected",
  },
];

export default function ProposalsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-5 py-10 md:px-10">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-10">

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

        </div>

        {/* PAGE TITLE */}

        <div className="mb-8">

          <h1 className="text-3xl font-bold text-gray-900">
            My Proposals
          </h1>

          <p className="text-gray-500 mt-2">
            Track all your submitted project proposals.
          </p>

        </div>

        {/* SUMMARY CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Total Proposals</p>
            <h2 className="text-3xl font-bold text-indigo-600 mt-2">
              {proposals.length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Accepted</p>
            <h2 className="text-3xl font-bold text-green-600 mt-2">
              {proposals.filter(p => p.status === "Accepted").length}
            </h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <p className="text-gray-500">Pending</p>
            <h2 className="text-3xl font-bold text-orange-500 mt-2">
              {proposals.filter(p => p.status === "Pending").length}
            </h2>
          </div>

        </div>

        {/* PROPOSAL LIST */}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

          <div className="p-6 border-b">

            <h2 className="text-xl font-bold text-gray-900">
              Submitted Proposals
            </h2>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="bg-slate-50">

                <tr className="text-gray-600 text-sm">

                  <th className="p-5">Project</th>
                  <th className="p-5">Client</th>
                  <th className="p-5">Your Budget</th>
                  <th className="p-5">Submitted Date</th>
                  <th className="p-5">Status</th>

                </tr>

              </thead>

              <tbody>

                {proposals.map((proposal) => (

                  <tr
                    key={proposal.id}
                    className="border-t hover:bg-slate-50 transition"
                  >

                    <td className="p-5 font-semibold text-gray-900">
                      {proposal.title}
                    </td>

                    <td className="p-5 text-gray-600">
                      {proposal.client}
                    </td>

                    <td className="p-5 font-semibold text-gray-900">
                      {proposal.budget}
                    </td>

                    <td className="p-5 text-gray-600">
                      {proposal.submitted}
                    </td>

                    <td className="p-5">

                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          proposal.status === "Accepted"
                            ? "bg-green-100 text-green-700"
                            : proposal.status === "Pending"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {proposal.status}
                      </span>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* BOTTOM BUTTON */}

        <div className="mt-8 flex justify-end">

          <Link
            href="/freelancer/projects"
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
          >
            Browse More Projects →
          </Link>

        </div>

      </div>

    </main>
  );
}