import { useState, useMemo } from "react";
import API_URL from "./services/apiBase";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    password: "",
    isTeacher: false,
  });

  // ---- helpers
  const onlyDigits = (s) => s.replace(/\D/g, "");
  const formatPhone = (digits) => {
    const d = onlyDigits(digits).slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  };

  const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

  // password score: 0-4
  const passwordScore = useMemo(() => {
    const p = formData.password || "";
    let score = 0;
    if (p.length >= 8) score++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) score++;
    if (/\d/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    return score;
  }, [formData.password]);

  const passwordLabel =
    ["Very weak", "Weak", "Fair", "Good", "Strong"][passwordScore] ||
    "Very weak";
  const passwordColors = [
    "bg-rose-500",
    "bg-amber-500",
    "bg-yellow-400",
    "bg-emerald-500",
    "bg-emerald-600",
  ];
  const passwordBar = Array.from({ length: 4 }, (_, i) => i < passwordScore);

  const validFirst = formData.firstName.trim().length >= 2;
  const validLast = formData.lastName.trim().length >= 2;
  const validDOB = Boolean(formData.dateOfBirth);
  const validEmail = isEmail(formData.email);
  const phoneDigits = onlyDigits(formData.phone);
  const validPhone = phoneDigits.length === 10;
  const validPassword = passwordScore >= 2 && formData.password.length >= 8; // at least Fair + 8 chars

  const formValid =
    validFirst &&
    validLast &&
    validDOB &&
    validEmail &&
    validPhone &&
    validPassword;

  // ---- events
  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;

    if (name === "phone") {
      setFormData((prev) => ({ ...prev, phone: formatPhone(value) }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formValid) return;

    try {
      const res = await fetch(`${API_URL}/user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          phone: phoneDigits, // send clean digits to server
        }),
      });

      const data = await res.json();
      toast.success(`${data.message || "Signed up"} 🎉`);

      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        email: "",
        phone: "",
        password: "",
        isTeacher: false,
      });

      // Navigate to log in page after successful sign up
      navigate("/sign-in", { replace: true });
    } catch (err) {
      toast.error("Error: " + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-16 px-6">
      {/* Title */}
      <div className="max-w-3xl mx-auto text-center mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900">
          Sign Up
        </h1>
        <p className="mt-3 text-lg text-slate-600">
          Create a new account to start using{" "}
          <span className="font-semibold text-indigo-600">Skill Grid</span>.
        </p>
      </div>

      {/* Card */}
      <div className="max-w-xl mx-auto overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
        <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Name row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Enter your first name"
                  required
                  className={`w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-sm focus:ring-4 transition
                    ${validFirst
                      ? "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
                      : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    }`}
                  aria-invalid={!validFirst}
                />
                {!validFirst && (
                  <p className="mt-1 text-xs text-rose-600">
                    Please enter at least 2 characters.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Enter your last name"
                  required
                  className={`w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-sm focus:ring-4 transition
                    ${validLast
                      ? "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
                      : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                    }`}
                  aria-invalid={!validLast}
                />
                {!validLast && (
                  <p className="mt-1 text-xs text-rose-600">
                    Please enter at least 2 characters.
                  </p>
                )}
              </div>
            </div>

            {/* DOB */}
            <div>
              <label
                htmlFor="dateOfBirth"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Date of Birth
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className={`w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-sm focus:ring-4 transition
                  ${validDOB
                    ? "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
                    : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  }`}
                aria-invalid={!validDOB}
              />
              {!validDOB && (
                <p className="mt-1 text-xs text-rose-600">
                  Please select your date of birth.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className={`w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-sm focus:ring-4 transition
                  ${validEmail
                    ? "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
                    : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  }`}
                aria-invalid={!validEmail}
              />
              {!validEmail && formData.email && (
                <p className="mt-1 text-xs text-rose-600">
                  Please enter a valid email address.
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                inputMode="numeric"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                required
                maxLength={16}
                className={`w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-sm focus:ring-4 transition
                  ${validPhone
                    ? "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
                    : "border-rose-300 focus:border-rose-400 focus:ring-rose-100"
                  }`}
                aria-invalid={!validPhone}
              />
              <p
                className={`mt-1 text-xs ${validPhone ? "text-slate-500" : "text-rose-600"
                  }`}
              >
                {validPhone
                  ? "Format: (XXX) XXX-XXXX"
                  : "Phone must be 10 digits."}
              </p>
            </div>

            {/* Password + strength */}
            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                required
                className={`w-full rounded-xl border px-4 py-2.5 text-slate-900 shadow-sm focus:ring-4 transition
                  ${validPassword
                    ? "border-slate-300 focus:border-indigo-400 focus:ring-indigo-100"
                    : "border-amber-300 focus:border-amber-400 focus:ring-amber-100"
                  }`}
                aria-invalid={!validPassword}
                aria-describedby="pw-help"
              />

              {/* Strength bar */}
              <div className="mt-2 flex gap-1" aria-hidden>
                {passwordBar.map((on, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded ${on ? passwordColors[passwordScore] : "bg-slate-200"
                      }`}
                  />
                ))}
              </div>
              <div className="mt-1 text-xs text-slate-600" id="pw-help">
                Strength: <span className="font-medium">{passwordLabel}</span>
              </div>

              {/* Checklist */}
              <ul className="mt-2 space-y-1 text-xs">
                <li
                  className={`${formData.password.length >= 8
                    ? "text-emerald-600"
                    : "text-slate-500"
                    }`}
                >
                  • At least 8 characters
                </li>
                <li
                  className={`${/[A-Z]/.test(formData.password) &&
                    /[a-z]/.test(formData.password)
                    ? "text-emerald-600"
                    : "text-slate-500"
                    }`}
                >
                  • Upper & lower case
                </li>
                <li
                  className={`${/\d/.test(formData.password)
                    ? "text-emerald-600"
                    : "text-slate-500"
                    }`}
                >
                  • At least one number
                </li>
                <li
                  className={`${/[^A-Za-z0-9]/.test(formData.password)
                    ? "text-emerald-600"
                    : "text-slate-500"
                    }`}
                >
                  • At least one symbol
                </li>
              </ul>
            </div>

            {/* Teacher checkbox */}
            <div className="flex items-center">
              <input
                id="isTeacher"
                name="isTeacher"
                type="checkbox"
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
              disabled={!formValid}
              className={`w-full rounded-2xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98]
                ${formValid
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-slate-300 cursor-not-allowed"
                }`}
              aria-disabled={!formValid}
            >
              Sign Up
            </button>

            {/* Sign in link */}
            <p className="text-center text-sm text-slate-600">
              Already have an account?{" "}
              <a
                href="/sign-in"
                className="font-medium text-indigo-600 hover:text-indigo-700 underline-offset-4 hover:underline"
              >
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default SignUp;
