import { Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../logo.png";

const Header = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const go = () => {
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      go();
    }
  };

  return (
    <>
      {/* Top hairline gradient */}
      <div className="h-1 w-full bg-gradient-to-r from-indigo-400 via-sky-400 to-indigo-500" />

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left: Brand */}
            <a href="/" className="flex items-center gap-3">
              <img
                src={logo}
                className="h-10 w-10 rounded-md object-contain ring-1 ring-slate-200"
                alt="Skill Grid Logo"
              />
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Skill <span className="text-indigo-600">Grid</span>
              </span>
            </a>

            {/* Center: Nav (desktop) */}
            <ul className="hidden md:flex items-center gap-8 font-medium">
              <li>
                <a
                  href="/"
                  className="text-slate-700 hover:text-indigo-600 transition"
                  aria-current="page"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="text-slate-700 hover:text-indigo-600 transition"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="text-slate-700 hover:text-indigo-600 transition"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/account"
                  className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
                >
                  Account
                </a>
              </li>
            </ul>

            {/* Right: Search + Account (desktop) */}
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </span>
                <input
                  id="search-navbar-desktop"
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={onKeyDown}
                  placeholder="Search…"
                  className="w-64 rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
                />
              </div>
            </div>

            {/* Mobile: toggles */}
            <div className="md:hidden flex items-center gap-2">
              {/* Mobile search button triggers menu (which includes search) */}
              <button
                onClick={() => setOpen((o) => !o)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition"
                aria-controls="mobile-menu"
                aria-expanded={open}
              >
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 17 14"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M1 1h15M1 7h15M1 13h15"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className={`${
            open ? "block" : "hidden"
          } md:hidden border-t border-slate-200 bg-white`}
        >
          <div className="px-4 py-4 space-y-4">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <svg
                  className="h-4 w-4 text-slate-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </span>
              <input
                id="search-navbar-mobile"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  onKeyDown(e);
                  if (e.key === "Enter") setOpen(false);
                }}
                placeholder="Search…"
                className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
              />
            </div>

            <ul className="grid gap-1 font-medium">
              <li>
                <a
                  href="/"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                >
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100 transition"
                >
                  Privacy
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="block text-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition"
                >
                  Account
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <Outlet />
    </>
  );
};

export default Header;
