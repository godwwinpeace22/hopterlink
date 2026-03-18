import { Link, useNavigate } from "@/lib/router";
import { useTranslation } from "react-i18next";
import {
  Star,
  MapPin,
  CheckCircle2,
  Briefcase,
  Clock,
  Search,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useState, useMemo } from "react";

const VISIBLE_ROWS = 2;
const CARDS_PER_ROW = 3;
const VISIBLE_COUNT = VISIBLE_ROWS * CARDS_PER_ROW;

type ProviderListing = {
  id: string;
  name: string;
  avatar: string;
  tagline: string;
  category: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate: number;
  location: string;
  verified: boolean;
  skills: string[];
  portfolio: string[];
  availability: "available" | "busy" | "offline";
  responseTime: string;
};

function availabilityColor(status: ProviderListing["availability"]) {
  switch (status) {
    case "available":
      return "bg-green-500";
    case "busy":
      return "bg-amber-500";
    case "offline":
      return "bg-gray-400";
  }
}

function availabilityLabel(status: ProviderListing["availability"]) {
  switch (status) {
    case "available":
      return "providers.available";
    case "busy":
      return "providers.busy";
    case "offline":
      return "providers.offline";
  }
}

function formatResponseTime(minutes: number | null): string {
  if (!minutes) return "";
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
  return `${Math.round(minutes / 1440)}d`;
}

function ProviderCard({
  provider,
  t,
}: {
  provider: ProviderListing;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  return (
    <Link
      to={`/providers/${provider.id}`}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Cover / portfolio preview */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {provider.portfolio[0] ? (
          <img
            src={provider.portfolio[0]}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100" />
        )}
        <div className="absolute top-3 right-3">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full text-white ${availabilityColor(provider.availability)}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
            {t(availabilityLabel(provider.availability))}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="relative">
            <img
              src={
                provider.avatar ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(provider.name)}&background=F7C876&color=fff`
              }
              alt={provider.name}
              className="h-12 w-12 rounded-full object-cover border-2 border-white shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://ui-avatars.com/api/?name=" +
                  encodeURIComponent(provider.name) +
                  "&background=F7C876&color=fff";
              }}
            />
            {provider.verified && (
              <CheckCircle2 className="absolute -bottom-0.5 -right-0.5 h-4 w-4 text-blue-500 fill-white" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {provider.name}
            </h3>
            <p className="text-xs text-gray-500 truncate">{provider.tagline}</p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
            {provider.rating.toFixed(1)} ({provider.reviewCount})
          </span>
          <span className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5" />
            {provider.completedJobs} {t("providers.jobs")}
          </span>
          {provider.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {provider.location.split(",")[0]}
            </span>
          )}
        </div>

        {/* Skills */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {provider.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 bg-gray-100 text-gray-700 text-[11px] font-medium rounded-md"
            >
              {skill}
            </span>
          ))}
          {provider.skills.length > 3 && (
            <span className="px-2 py-0.5 text-gray-400 text-[11px]">
              +{provider.skills.length - 3}
            </span>
          )}
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-900">
            ${provider.hourlyRate}
            <span className="text-xs font-normal text-gray-500">
              {t("providers.perHour")}
            </span>
          </p>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            {provider.responseTime || t("providers.flexible")}
          </span>
        </div>
      </div>
    </Link>
  );
}

function useProviderListings() {
  return useQuery({
    queryKey: ["public-providers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_profiles")
        .select(
          `
          user_id,
          business_name,
          bio,
          services,
          hourly_rate,
          service_areas,
          rating,
          total_reviews,
          jobs_completed,
          verification_status,
          availability,
          response_time,
          portfolio_urls,
          profile:profiles!provider_profiles_user_id_fkey (
            full_name,
            avatar_url,
            location
          )
        `,
        )
        .eq("verification_status", "approved")
        .order("rating", { ascending: false });

      if (error) throw error;

      return (data ?? []).map((p): ProviderListing => {
        const profile = Array.isArray(p.profile) ? p.profile[0] : p.profile;
        const availObj = p.availability as Record<string, unknown> | null;
        const hasAvailability = availObj && Object.keys(availObj).length > 0;
        const locationObj = profile?.location as {
          city?: string;
          address?: string;
        } | null;

        return {
          id: p.user_id,
          name: profile?.full_name ?? p.business_name ?? "",
          avatar: profile?.avatar_url ?? "",
          tagline: p.business_name ?? p.services?.[0] ?? "",
          category: p.services?.[0] ?? "",
          rating: p.rating ?? 0,
          reviewCount: p.total_reviews ?? 0,
          completedJobs: p.jobs_completed ?? 0,
          hourlyRate: p.hourly_rate ?? 0,
          location: locationObj?.city ?? p.service_areas?.[0] ?? "",
          verified: p.verification_status === "approved",
          skills: p.services ?? [],
          portfolio: p.portfolio_urls ?? [],
          availability: hasAvailability ? "available" : "offline",
          responseTime: formatResponseTime(p.response_time),
        };
      });
    },
  });
}

export function Providers() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const showAll = !!user;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: providers = [], isLoading } = useProviderListings();

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return providers;
    const q = searchQuery.toLowerCase();
    return providers.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q) ||
        p.skills.some((s) => s.toLowerCase().includes(q)),
    );
  }, [providers, searchQuery]);

  const visibleProviders = showAll
    ? filtered
    : filtered.slice(0, VISIBLE_COUNT);

  const displayProviders = visibleProviders.map((provider) => ({
    ...provider,
    name: provider.name || t("providers.providerDefault"),
    tagline: provider.tagline || t("providers.professionalServices"),
    category: provider.category || t("providers.general"),
  }));

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            {t("providers.title")}{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t("providers.titleAccent")}
            </span>
          </h1>
          <p className="text-gray-600 max-w-2xl">{t("providers.subtitle")}</p>
        </div>

        {/* Search / filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("providers.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Grid */}
        <div className="relative">
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              {t("providers.loading")}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} t={t} />
              ))}
            </div>
          )}

          {/* Fade overlay + sign-up prompt for unauthenticated users */}
          {!showAll && filtered.length > VISIBLE_COUNT && (
            <div className="relative -mt-40 pt-40 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-transparent" />
              <div className="relative flex flex-col items-center pb-6 pointer-events-auto">
                <p className="text-gray-700 font-medium mb-1">
                  {t("providers.signInToViewAll", { count: filtered.length })}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {t("providers.createFree")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate("/signin")}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {t("providers.signIn")}
                  </button>
                  <button
                    onClick={() => navigate("/client-signup")}
                    className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm font-medium hover:from-amber-600 hover:to-orange-600 transition-all"
                  >
                    {t("providers.getStartedFree")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
