const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-sky-50 via-white to-indigo-50/40 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between text-sm">
        {/* Copyright */}
        <p className="text-slate-600 mb-4 sm:mb-0 text-center sm:text-left">
          © {new Date().getFullYear()}{" "}
          <span className="font-semibold text-indigo-600">Skill Grid</span>. All
          rights reserved.
        </p>

        {/* Nav Links */}
        <nav className="flex flex-wrap justify-center sm:justify-end gap-4 font-medium">
          <a
            href="/about"
            className="text-slate-600 hover:text-indigo-600 transition"
          >
            About
          </a>
          <a
            href="/contact"
            className="text-slate-600 hover:text-indigo-600 transition"
          >
            Contact
          </a>
          <a
            href="/privacy"
            className="text-slate-600 hover:text-indigo-600 transition"
          >
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
