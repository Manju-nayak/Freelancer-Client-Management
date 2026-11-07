import Link from "next/link";

export default function Login() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-10">

      <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-2xl shadow-xl border border-gray-100">

        {/* LOGO */}
        <div className="text-center mb-8">

          <Link
            href="/"
            className="text-3xl font-bold text-indigo-600"
          >
            FreelanceHub.
          </Link>

          <h1 className="text-3xl font-bold mt-7 text-gray-900">
            Welcome Back!
          </h1>

          <p className="text-gray-500 mt-3">
            Login to continue your freelancing journey.
          </p>

        </div>


        {/* LOGIN FORM */}
        <form className="space-y-6">

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
              placeholder="Enter your password"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder:text-gray-400 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
            />

          </div>


          {/* REMEMBER ME */}
          <div className="flex items-center justify-between text-sm">

            <label className="flex items-center gap-2 text-gray-600">

              <input
                type="checkbox"
                className="accent-indigo-600"
              />

              Remember me

            </label>

            <button
              type="button"
              className="text-indigo-600 font-semibold hover:text-indigo-800"
            >
              Forgot Password?
            </button>

          </div>


          {/* LOGIN BUTTON */}
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3.5 rounded-lg font-semibold hover:bg-indigo-700 active:scale-[0.98] transition duration-200 shadow-md shadow-indigo-100"
          >
            Login
          </button>

        </form>


        {/* REGISTER LINK */}
        <p className="text-center text-gray-600 mt-8">

          Don't have an account?{" "}

          <Link
            href="/register"
            className="text-indigo-600 font-semibold hover:text-indigo-800"
          >
            Create Account
          </Link>

        </p>


        {/* FOOTER */}
        <div className="text-center mt-7 text-xs text-gray-400">

          Secure Login | FreelanceHub

        </div>

      </div>

    </main>
  );
}