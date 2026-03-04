import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import logo from "@/assets/logo.png";

const productLinks = [
  { label: "Features", to: "/services" },
  { label: "Pricing", to: "/pricing" },
  { label: "Case Studies", to: "#" },
  { label: "Reviews", to: "#" },
  { label: "Updates", to: "#" },
];

const supportLinks = [
  { label: "Getting Started", to: "#" },
  { label: "Help Center", to: "#" },
  { label: "Server Status", to: "#" },
  { label: "Report a Bug", to: "#" },
  { label: "Chat Support", to: "#" },
];

const providerLinks = [
  { label: "About", to: "/about" },
  { label: "Contact Us", to: "#" },
  { label: "Careers", to: "#" },
  { label: "FAQ's", to: "/how-it-works" },
  { label: "Blog", to: "#" },
];

const socialLinks = [
  { icon: Facebook, label: "Facebook", to: "#" },
  { icon: Instagram, label: "Instagram", to: "#" },
  { icon: Twitter, label: "Twitter", to: "#" },
  { icon: MessageCircle, label: "WhatsApp", to: "#" },
  { icon: Youtube, label: "YouTube", to: "#" },
  { icon: Linkedin, label: "LinkedIn", to: "#" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Top Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <Link to="/" className="inline-flex items-center mb-8">
          <img src={logo} alt="Hopterlink" className="h-6 w-auto" />
        </Link>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Product */}
          <div>
            <h5 className="text-white font-semibold mb-4">Product</h5>
            <ul className="space-y-3">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="text-white font-semibold mb-4">Support</h5>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Provider */}
          <div>
            <h5 className="text-white font-semibold mb-4">For Provider</h5>
            <ul className="space-y-3">
              {providerLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe & App */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-5 mb-5">
              <h5 className="text-white font-semibold mb-3">
                Sign Up For Subscription
              </h5>
              <div className="mb-3">
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder:text-gray-400 outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <button className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all">
                Subscribe
              </button>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Download Our App</p>
              <div className="flex items-center gap-3 flex-wrap">
                <img
                  src="/img/icons/app-store.svg"
                  alt="App Store"
                  className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
                />
                <img
                  src="/img/icons/goolge-play.svg"
                  alt="Google Play"
                  className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Social + Language */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-gray-800">
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.to}
                className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-4 w-4 text-gray-400 hover:text-white" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-gray-500">
              Copyright © 2026 — All Rights Reserved Hopterlink
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Terms and Conditions
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
