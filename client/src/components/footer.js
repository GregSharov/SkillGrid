const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-600">
        <p className="mb-2 sm:mb-0">
          © {new Date().getFullYear()} Skill Grid. All rights reserved.
        </p>

        <nav className="flex space-x-4">
          <a
            href="/about"
            className="hover:text-gray-900 transition-colors duration-200"
          >
            About
          </a>
          <a
            href="/contact"
            className="hover:text-gray-900 transition-colors duration-200"
          >
            Contact
          </a>
          <a
            href="/privacy"
            className="hover:text-gray-900 transition-colors duration-200"
          >
            Privacy
          </a>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
