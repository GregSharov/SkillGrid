import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-indigo-50/40 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-14">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Your privacy matters to us. This policy explains how SkillGrid
            collects, uses, and protects your information so you can learn and
            teach with confidence.
          </p>
          
        </header>

        <div className="space-y-10">
          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              1. Information We Collect
            </h2>
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  A. Personal Information
                </h3>
                <ul className="mt-3 list-disc list-inside text-slate-600 space-y-2">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Password (encrypted)</li>
                  <li>User role (Student or Teacher)</li>
                  <li>Age</li>
                  <li>Profile photo (optional)</li>
                  <li>Reviews, ratings, and feedback</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  B. Usage Data
                </h3>
                <ul className="mt-3 list-disc list-inside text-slate-600 space-y-2">
                  <li>IP address</li>
                  <li>Browser info, pages visited, session time</li>
                  <li>Device type and operating system</li>
                  <li>Referral source</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">
                  C. Cookies
                </h3>
                <p className="mt-3 text-slate-600">
                  We use cookies to manage sessions, remember preferences, and
                  analyze site performance.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              2. How We Use Your Information
            </h2>
            <ul className="mt-6 list-disc list-inside text-slate-600 space-y-2">
              <li>Create and manage SkillGrid accounts</li>
              <li>Enable lesson bookings and scheduling</li>
              <li>Facilitate video communications through trusted partners</li>
              <li>Display content, collect feedback, and showcase reviews</li>
              <li>Send important service-related updates and reminders</li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900">3. Data Sharing</h2>
            <p className="mt-6 text-slate-600">
              We do <span className="font-semibold text-slate-900">not</span>{" "}
              sell your personal information. We may share data only with:
            </p>
            <ul className="mt-4 list-disc list-inside text-slate-600 space-y-2">
              <li>Service providers who support platform operations</li>
              <li>Analytics tools that help improve SkillGrid</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              4. Data Storage &amp; Protection
            </h2>
            <ul className="mt-6 list-disc list-inside text-slate-600 space-y-2">
              <li>Encrypted HTTPS/SSL communication</li>
              <li>Hashed passwords and secure authentication practices</li>
              <li>MongoDB Atlas managed database with advanced safeguards</li>
              <li>Access restricted to authorized team members only</li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900">5. Your Rights</h2>
            <p className="mt-6 text-slate-600">
              You are in control of your data. At any time you can:
            </p>
            <ul className="mt-4 list-disc list-inside text-slate-600 space-y-2">
              <li>Access or update your personal information</li>
              <li>Request deletion of your account or profile data</li>
              <li>Adjust cookie preferences through your browser settings</li>
              <li>
                Email us to withdraw consent at{" "}
                <a
                  href="mailto:Latishovi@gmail.com"
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Latishovi@gmail.com
                </a>
              </li>
            </ul>
          </section>

          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              6. Children&apos;s Privacy
            </h2>
            <p className="mt-6 text-slate-600">
              SkillGrid is designed for users aged 13 and above. We do not
              knowingly collect data from children under 13, and any such data
              will be removed immediately.
            </p>
          </section>

          <section className="bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 p-10">
            <h2 className="text-2xl font-bold text-slate-900">
              7. Changes to This Policy
            </h2>
            <p className="mt-6 text-slate-600">
              We will update this page whenever we make significant changes to
              our privacy practices and notify you via email or in-app message.
            </p>
            <p className="mt-6 text-sm text-slate-500">
              Last updated: <em>[01/10/2025]</em>
            </p>
          </section>

          <section className="bg-indigo-600/10 border border-indigo-200 rounded-3xl p-10 text-center">
            <h2 className="text-2xl font-semibold text-indigo-900">
              Have questions about your privacy?
            </h2>
            <p className="mt-4 text-slate-600">
              Reach out anytime at{" "}
              <a
                href="mailto:Latishovi@gmail.com"
                className="text-indigo-600 font-medium hover:underline"
              >
                Latishovi@gmail.com
              </a>{" "}
              and we will be glad to help.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
