import { Link } from "@/lib/router";
import { Facebook, Instagram, Twitter } from "lucide-react";
import logo from "@/assets/logo.png";
import { useTranslation } from "react-i18next";

const socialLinks = [
  { icon: Facebook, label: "Facebook", to: "https://facebook.com/hopterlink" },
  {
    icon: Instagram,
    label: "Instagram",
    to: "https://instagram.com/hopterlink",
  },
  { icon: Twitter, label: "Twitter", to: "https://x.com/hopterlink" },
];

export function Footer() {
  const { t } = useTranslation();

  const productLinks = [
    { label: t("footer.features"), to: "/services" },
    { label: t("header.howItWorks"), to: "/how-it-works" },
    { label: t("header.providers"), to: "/providers" },
  ];

  const supportLinks = [
    { label: t("footer.helpCenter"), to: "/help" },
    { label: t("common.termsAndConditions"), to: "/terms" },
    { label: t("common.privacyPolicy"), to: "/privacy" },
  ];

  const providerLinks = [
    { label: t("header.about"), to: "/about" },
    { label: t("footer.faqs"), to: "/how-it-works" },
    { label: t("footer.becomeProvider"), to: "/sign-up" },
  ];

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
            <h5 className="text-white font-semibold mb-4">
              {t("footer.productTitle")}
            </h5>
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
            <h5 className="text-white font-semibold mb-4">
              {t("footer.supportTitle")}
            </h5>
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
            <h5 className="text-white font-semibold mb-4">
              {t("footer.forProviderTitle")}
            </h5>
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

          {/* App Download */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div>
              <p className="text-white font-semibold mb-3">
                {t("footer.downloadTitle")}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                {t("footer.downloadSubtitle")}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <img
                  src="/img/icons/app-store.svg"
                  alt="App Store"
                  className="h-10 cursor-pointer hover:opacity-80 transition-opacity"
                />
                <img
                  src="/img/icons/google-play.svg"
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
                target="_blank"
                rel="noopener noreferrer"
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
            <p className="text-sm text-gray-500">{t("footer.copyright")}</p>
            <div className="flex items-center gap-6">
              <Link
                to="/terms"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                {t("common.termsAndConditions")}
              </Link>
              <Link
                to="/privacy"
                className="text-sm text-gray-500 hover:text-white transition-colors"
              >
                {t("common.privacyPolicy")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
