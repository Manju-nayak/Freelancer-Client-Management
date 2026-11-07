{/* Top Navigation */}
<header className="flex flex-col justify-between gap-4 bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center">
  <div>
    <h1 className="text-2xl font-bold text-blue-700">
      FreelanceHub
    </h1>
    <p className="text-sm text-gray-500">
      Administration Panel
    </p>
  </div>

  <div className="flex flex-wrap items-center gap-3">
    <Link
      href="/admin/dashboard"
      className="rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
    >
      Dashboard
    </Link>

    <Link
      href="/client/dashboard"
      className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
    >
      Client
    </Link>

    <Link
      href="/freelancer/dashboard"
      className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
    >
      Freelancer
    </Link>

    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
      Administrator
    </span>

    <Link
      href="/"
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
    >
      Logout
    </Link>
  </div>
</header>