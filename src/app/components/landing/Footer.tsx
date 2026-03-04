import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 bg-[#F7C876] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">FH</span>
              </div>
              <span className="text-xl font-bold text-white">Fixers Hive</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connecting clients with trusted local service providers across
              Canada and the United States.{" "}
            </p>
            <div className="flex gap-4">
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 hover:bg-[#F7C876] rounded-full flex items-center justify-center transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 hover:bg-[#F7C876] rounded-full flex items-center justify-center transition-colors"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 hover:bg-[#F7C876] rounded-full flex items-center justify-center transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="h-10 w-10 bg-gray-800 hover:bg-[#F7C876] rounded-full flex items-center justify-center transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Clients */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Clients</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/services"
                  className="hover:text-[#F7C876] transition-colors"
                >
                  Browse Services
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="hover:text-[#F7C876] transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-[#F7C876] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#F7C876] transition-colors"
                >
                  About us
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works#faq"
                  className="hover:text-[#F7C876] transition-colors"
                >
                  Client FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="text-white font-semibold mb-4">For Providers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/signup"
                  className="hover:text-[#F7C876] transition-colors"
                >
                  Become a Provider
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Provider Benefits
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Commission Structure
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Insurance Options
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Provider FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#F7C876] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[#F7C876] transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            © 2026 Fixers Hive Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-[#F7C876] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#F7C876] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#F7C876] transition-colors">
              Cookie Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
