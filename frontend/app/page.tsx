import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-10 py-6 border-b">

        <h1 className="text-2xl font-bold text-indigo-600">
          FreelanceHub.
        </h1>

        <div className="hidden md:flex gap-8 text-gray-600">
          <a href="#home" className="hover:text-indigo-600">Home</a>
          <a href="#features" className="hover:text-indigo-600">Features</a>
          <a href="#how" className="hover:text-indigo-600">How It Works</a>
        </div>

        <div className="flex gap-3">
          <Link href="/login"
            className="px-5 py-2 font-medium hover:text-indigo-600">
            Login
          </Link>

          <Link href="/register"
            className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Get Started
          </Link>
        </div>

      </nav>


      {/* HERO SECTION */}
      <section id="home"
        className="px-10 py-24 text-center bg-gradient-to-br from-indigo-50 to-white">

        <p className="text-indigo-600 font-semibold mb-5">
          YOUR WORK. YOUR TALENT. YOUR SUCCESS.
        </p>

        <h2 className="text-5xl md:text-6xl font-bold leading-tight">
          Find the Right Talent.
          <br />
          <span className="text-indigo-600">
            Build Great Projects.
          </span>
        </h2>

        <p className="text-gray-600 mt-6 text-lg max-w-2xl mx-auto">
          A smarter platform connecting talented freelancers
          with clients. Manage projects, collaborate, track
          deadlines and achieve success together.
        </p>

        <div className="flex justify-center gap-4 mt-10 flex-wrap">

          <Link href="/register"
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700">
            Find a Freelancer →
          </Link>

          <Link href="/projects"
            className="border border-gray-300 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100">
            Explore Projects
          </Link>

        </div>

      </section>


      {/* FEATURES SECTION */}
      <section id="features" className="px-10 py-20">

        <h2 className="text-3xl font-bold text-center">
          Everything You Need in One Place
        </h2>

        <p className="text-gray-500 text-center mt-3">
          Manage your entire freelancing journey with ease.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-14">

          <div className="p-8 border rounded-2xl hover:shadow-lg">
            <div className="text-4xl mb-5">👥</div>
            <h3 className="text-xl font-bold">Smart Connections</h3>
            <p className="text-gray-600 mt-3">
              Connect clients with freelancers based on
              their skills and project requirements.
            </p>
          </div>

          <div className="p-8 border rounded-2xl hover:shadow-lg">
            <div className="text-4xl mb-5">📋</div>
            <h3 className="text-xl font-bold">Project Management</h3>
            <p className="text-gray-600 mt-3">
              Organize tasks, manage milestones and
              monitor project deadlines.
            </p>
          </div>

          <div className="p-8 border rounded-2xl hover:shadow-lg">
            <div className="text-4xl mb-5">💳</div>
            <h3 className="text-xl font-bold">Payment Tracking</h3>
            <p className="text-gray-600 mt-3">
              Track milestone payments and maintain
              transparent transaction records.
            </p>
          </div>

        </div>

      </section>


      {/* HOW IT WORKS */}
      <section id="how" className="bg-gray-50 px-10 py-20">

        <h2 className="text-3xl font-bold text-center">
          How FreelanceHub Works
        </h2>

        <div className="grid md:grid-cols-3 gap-10 mt-14 text-center">

          <div>
            <div className="text-4xl">📝</div>
            <h3 className="font-bold text-xl mt-4">
              1. Create an Account
            </h3>
            <p className="text-gray-600 mt-2">
              Register as a client or freelancer.
            </p>
          </div>

          <div>
            <div className="text-4xl">🤝</div>
            <h3 className="font-bold text-xl mt-4">
              2. Connect & Collaborate
            </h3>
            <p className="text-gray-600 mt-2">
              Find projects, submit proposals and create contracts.
            </p>
          </div>

          <div>
            <div className="text-4xl">🚀</div>
            <h3 className="font-bold text-xl mt-4">
              3. Complete Projects
            </h3>
            <p className="text-gray-600 mt-2">
              Track milestones, payments and project progress.
            </p>
          </div>

        </div>

      </section>


      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-8">

        <h2 className="text-xl font-bold">
          FreelanceHub.
        </h2>

        <p className="text-gray-400 mt-3">
          Connecting Talent. Delivering Success.
        </p>

        <p className="text-gray-500 text-sm mt-5">
          © 2026 FreelanceHub. All rights reserved.
        </p>

      </footer>

    </main>
  );
}