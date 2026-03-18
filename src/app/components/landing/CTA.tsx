import { useNavigate } from "@/lib/router";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function CTA() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-20 bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {t("cta.addServicesTitle")}{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {t("cta.addServicesHighlight")}
              </span>
            </h2>
            <p className="text-gray-400 leading-relaxed">
              {t("cta.addServicesSubtitle")}
            </p>
            <button
              onClick={() => navigate("/provider-signup")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all"
            >
              <UserPlus className="h-5 w-5" />
              {t("cta.joinUs")}
            </button>
          </div>

          {/* Right Image */}
          <div className="hidden md:flex justify-end">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/img/business.jpg"
                alt="Business growth"
                className="w-full max-w-md object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
