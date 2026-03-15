import { useParams, Link, useNavigate } from "@/lib/router";
import {
  Star,
  MapPin,
  CheckCircle2,
  Briefcase,
  Clock,
  MessageCircle,
  ArrowLeft,
  Calendar,
  Shield,
  Loader2,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

function formatResponseTime(minutes: number | null): string {
  if (!minutes) return "Within a day";
  if (minutes < 60) return `Within ${minutes} min`;
  if (minutes < 1440) return `Within ${Math.round(minutes / 60)} hr`;
  return `Within ${Math.round(minutes / 1440)} days`;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

function useProviderProfile(providerId: string | undefined) {
  return useQuery({
    queryKey: ["provider-profile", providerId],
    queryFn: async () => {
      if (!providerId) return null;
      const { data, error } = await supabase
        .from("provider_profiles")
        .select(
          `
          user_id, business_name, bio, services, hourly_rate,
          service_areas, rating, total_reviews, jobs_completed,
          verification_status, response_time, portfolio_urls,
          created_at,
          profile:profiles!provider_profiles_user_id_fkey (
            full_name, avatar_url, location
          )
        `,
        )
        .eq("user_id", providerId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!providerId,
  });
}

function useProviderReviews(providerId: string | undefined) {
  return useQuery({
    queryKey: ["provider-reviews", providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
          id, rating, comment, created_at,
          reviewer:profiles!reviews_reviewer_id_fkey ( full_name )
        `,
        )
        .eq("reviewee_id", providerId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!providerId,
  });
}

export function ProviderProfile() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: provider, isLoading, error } = useProviderProfile(providerId);
  const { data: reviews = [] } = useProviderReviews(providerId);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Provider not found
        </h2>
        <p className="text-gray-500 mb-6">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/providers"
          className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Providers
        </Link>
      </div>
    );
  }

  const profile = Array.isArray(provider.profile)
    ? provider.profile[0]
    : provider.profile;
  const name = profile?.full_name ?? provider.business_name ?? "Provider";
  const avatarUrl = profile?.avatar_url;
  const loc = profile?.location as { city?: string; address?: string } | null;
  const location = loc?.city ?? loc?.address ?? "Canada";
  const verified = provider.verification_status === "approved";
  const portfolio = provider.portfolio_urls ?? [];
  const memberDate = new Date(provider.created_at).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/providers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All Providers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== Left column — main info ===== */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Cover */}
              <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-50 overflow-hidden">
                {portfolio[0] && (
                  <img
                    src={portfolio[0]}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="p-6 -mt-12 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <img
                    src={
                      avatarUrl ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F7C876&color=fff&size=96`
                    }
                    alt={name}
                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F7C876&color=fff&size=96`;
                    }}
                  />
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {name}
                      </h1>
                      {verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    {provider.business_name &&
                      provider.business_name !== name && (
                        <p className="text-gray-600 mt-0.5">
                          {provider.business_name}
                        </p>
                      )}
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <strong className="text-gray-900">
                      {provider.rating?.toFixed(1) ?? "New"}
                    </strong>{" "}
                    ({provider.total_reviews ?? 0} reviews)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    {provider.jobs_completed ?? 0} jobs completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Responds{" "}
                    {formatResponseTime(provider.response_time).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            {provider.bio && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  About
                </h2>
                <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
              </div>
            )}

            {/* Portfolio gallery */}
            {portfolio.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Portfolio
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {portfolio.map((img: string, i: number) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={img}
                        alt={`Portfolio ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews
              </h2>
              {reviews.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              ) : (
                <div className="space-y-5">
                  {reviews.map((review) => {
                    const reviewer = Array.isArray(review.reviewer)
                      ? review.reviewer[0]
                      : review.reviewer;
                    return (
                      <div
                        key={review.id}
                        className="pb-5 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {reviewer?.full_name ?? "Anonymous"}
                            </span>
                            <StarRow rating={review.rating} />
                          </div>
                          <span className="text-xs text-gray-400">
                            {review.created_at
                              ? new Date(review.created_at).toLocaleDateString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : ""}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-gray-600">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ===== Right column — sidebar ===== */}
          <div className="space-y-6">
            {/* Hire card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                ${provider.hourly_rate ?? 0}
                <span className="text-base font-normal text-gray-500">/hr</span>
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Starting price — final quote after brief
              </p>

              <button
                onClick={() => {
                  if (!user) {
                    navigate("/sign-in");
                    return;
                  }
                  navigate("/dashboard/client/booking", {
                    state: { providerId: provider.user_id, providerName: name },
                  });
                }}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all mb-3"
              >
                Hire {name.split(" ")[0]}
              </button>
              <button
                onClick={() => {
                  if (!user) {
                    navigate("/sign-in");
                    return;
                  }
                  navigate("/dashboard/client/messages", {
                    state: {
                      recipientId: provider.user_id,
                      recipientName: name,
                    },
                  });
                }}
                className="w-full py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Send Message
              </button>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Member since {memberDate}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  {verified ? "Identity verified" : "Verification pending"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Avg. response:{" "}
                  {formatResponseTime(provider.response_time).toLowerCase()}
                </div>
              </div>
            </div>

            {/* Services */}
            {provider.services && provider.services.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Services
                </h3>
                <div className="flex flex-wrap gap-2">
                  {provider.services.map((service: string) => (
                    <span
                      key={service}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Service Areas */}
            {provider.service_areas && provider.service_areas.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Service Areas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {provider.service_areas.map((area: string) => (
                    <span key={area} className="text-sm text-gray-600">
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
