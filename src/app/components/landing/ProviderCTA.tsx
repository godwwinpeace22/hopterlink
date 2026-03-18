import { useNavigate } from "@/lib/router";
import { UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ProviderCTA() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden px-6 py-12 sm:px-12 sm:py-16">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 opacity-10">
            <img src="/img/bg/provide-bg-01.svg" alt="" className="w-64" />
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <img src="/img/bg/provide-bg-02.svg" alt="" className="w-64" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-amber-400 font-medium mb-2">
                {t("providerCta.eyebrow")}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                {t("providerCta.titleMain")}{" "}
                <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                  {t("providerCta.titleHighlight")}
                </span>
              </h2>
            </div>
            <button
              onClick={() => navigate("/provider-signup")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all whitespace-nowrap"
            >
              <UserPlus className="h-5 w-5" />
              {t("providerCta.joinUs")}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
