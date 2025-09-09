import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API_URL from "./services/apiBase";

function SignIn() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    isTeacher: false,
  });
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (event) => {
    const { name, type, value, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(false);

    try {
      const res = await fetch(`${API_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        setError(true);
        const data = await res.json().catch(() => ({}));
        console.error("Login failed:", data?.message || res.statusText);
        return;
      }

      navigate("/account");
    } catch (err) {
      setError(true);
      console.error("Error during login:", err);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-16 px-6">
      {/* Title */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
          Log In
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Welcome back! Please log in to continue to your account.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-md mx-auto overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
        {/* decorative hairline */}
        <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />

        <div className="p-8">
          {/* Error alert */}
          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              Please check email or password or “I am a teacher” box.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
              />
            </div>

            {/* Teacher checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isTeacher"
                name="isTeacher"
                checked={formData.isTeacher}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label
                htmlFor="isTeacher"
                className="ml-2 text-sm text-slate-700"
              >
                I am a teacher
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full rounded-2xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
            >
              Log In
            </button>

            {/* Sign up link */}
            <p className="text-center text-sm text-slate-600">
              No account?{" "}
              <a
                href="/sign-up"
                className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline"
              >
                Create one
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default SignIn;
