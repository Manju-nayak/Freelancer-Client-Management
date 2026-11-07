import Link from "next/link";

export default function Register() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-10">

      <div className="bg-white w-full max-w-lg p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">

        {/* LOGO AND HEADING */}
        <div className="text-center mb-8">

          <Link
            href="/"
            className="text-3xl font-bold text-indigo-600"
          >
            FreelanceHub.
          </Link>

          <h1 className="text-3xl font-bold mt-7 text-gray-900">
            Create Your Account
          </h1>

          <p className="text-gray-500 mt-3">
            Join our community and start collaborating.
          </p>

        </div>


        {/* REGISTRATION FORM */}
        <form className="space-y-5">

          {/* FULL NAME */}
          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              Full Name
            </label>

            <input
              type="text"
              placeholder="Enter your full name"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>


          {/* EMAIL */}
          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>


          {/* PASSWORD */}
          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              Password
            </label>

            <input
              type="password"
              placeholder="Create a password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>


          {/* CONFIRM PASSWORD */}
          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              Confirm Password
            </label>

            <input
              type="password"
              placeholder="Confirm your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />
          </div>


          {/* USER ROLE */}
          <div>
            <label className="block font-semibold mb-2 text-gray-800">
              Register As
            </label>

            <select
              required
              defaultValue=""
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            >

              <option value="" disabled>
                Select your role
              </option>

              <option value="client">
                Client – I want to hire
              </option>

              <option value="freelancer">
                Freelancer – I want to work
              </option>

            </select>
          </div>


          {/* REGISTER BUTTON */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 active:scale-[0.98] transition duration-200 shadow-md shadow-indigo-100"
          >
            Create Account
          </button>

        </form>


        {/* LOGIN LINK */}
        <p className="text-center text-gray-600 mt-7">

          Already have an account?{" "}

          <Link
            href="/login"
            className="text-indigo-600 font-semibold hover:text-indigo-800"
          >
            Login
          </Link>

        </p>


        {/* FOOTER */}
        <p className="text-center text-xs text-gray-400 mt-6">
          By registering, you agree to our Terms and Privacy Policy.
        </p>

      </div>

    </main>
  );
}