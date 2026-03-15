import { useMemo } from "react";
import { useParams } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { PageHeader } from "@/app/components/ui/page-header";
import { Briefcase, Calendar, MapPin, Star } from "lucide-react";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "FH";
  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const getLocationLabel = (location: unknown) => {
  if (location && typeof location === "object") {
    const address = (location as { address?: string }).address;
    const city = (location as { city?: string }).city;
    return address ?? city ?? "";
  }
  return "";
};

export const PublicProfile = () => {
  const { userId } = useParams();

  const { data: profileResult, isLoading: isProfileLoading } = useSupabaseQuery(
    ["public_profile", userId],
    () =>
      supabase
        .from("profiles")
        .select("id, full_name, role, avatar_url, location, created_at")
        .eq("id", userId ?? "")
        .single(),
    { enabled: Boolean(userId) },
  );

  const role = profileResult?.data?.role ?? null;

  const { data: providerProfileResult } = useSupabaseQuery(
    ["public_profile_provider", userId],
    () =>
      supabase
        .from("provider_profiles")
        .select("rating, total_reviews, jobs_completed, bio")
        .eq("user_id", userId ?? "")
        .single(),
    { enabled: Boolean(userId) && role === "provider" },
  );

  const { data: bookingsResult } = useSupabaseQuery(
    ["public_profile_bookings", userId],
    () =>
      supabase
        .from("bookings")
        .select(
          `
            id,
            scheduled_date,
            status,
            service_type,
            location,
            client:profiles!bookings_client_id_fkey (
              id,
              full_name
            )
          `,
        )
        .eq("provider_id", userId ?? "")
        .order("scheduled_date", { ascending: false })
        .limit(5),
    { enabled: Boolean(userId) && role === "provider" },
  );

  const { data: jobsResult } = useSupabaseQuery(
    ["public_profile_jobs", userId],
    () =>
      supabase
        .from("jobs")
        .select("id, title, category, status, created_at, location")
        .eq("client_id", userId ?? "")
        .order("created_at", { ascending: false })
        .limit(5),
    { enabled: Boolean(userId) && role === "client" },
  );

  const { data: reviewsResult } = useSupabaseQuery(
    ["public_profile_reviews", userId],
    () =>
      supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          reviewer:profiles!reviews_reviewer_id_fkey (
            id,
            full_name
          )
        `,
        )
        .eq("reviewee_id", userId ?? "")
        .order("created_at", { ascending: false })
        .limit(5),
    { enabled: Boolean(userId) },
  );

  const displayName = profileResult?.data?.full_name ?? "";
  const avatarUrl = profileResult?.data?.avatar_url ?? "";
  const memberSince = profileResult?.data?.created_at
    ? new Date(profileResult.data.created_at).getFullYear()
    : null;
  const location = getLocationLabel(profileResult?.data?.location);

  const rating = useMemo(() => {
    const providerRating = providerProfileResult?.data?.rating;
    if (typeof providerRating === "number" && providerRating > 0) {
      return providerRating;
    }
    const reviews = reviewsResult?.data ?? [];
    if (reviews.length === 0) return 0;
    const total = reviews.reduce(
      (sum, review) => sum + (review.rating ?? 0),
      0,
    );
    return Number((total / reviews.length).toFixed(1));
  }, [providerProfileResult, reviewsResult]);

  const jobs = useMemo(() => {
    if (role === "provider") {
      const bookedJobs = (bookingsResult?.data ?? []).map((booking) => {
        const client = Array.isArray(booking.client)
          ? booking.client[0]
          : booking.client;

        return {
          id: booking.id,
          title: booking.service_type ?? "Service",
          subtitle: client?.full_name ?? "Client",
          status: booking.status ?? "",
          date: formatDate(booking.scheduled_date),
          location: getLocationLabel(booking.location),
        };
      });

      if (bookedJobs.length > 0) {
        return bookedJobs;
      }

      return (reviewsResult?.data ?? []).map((review) => {
        const reviewer = Array.isArray(review.reviewer)
          ? review.reviewer[0]
          : review.reviewer;

        return {
          id: review.id,
          title: "Completed service",
          subtitle: reviewer?.full_name ?? "Client",
          status: "completed",
          date: formatDate(review.created_at),
          location: "Service area",
        };
      });
    }

    return (jobsResult?.data ?? []).map((job) => ({
      id: job.id,
      title: job.title ?? "Job",
      subtitle: job.category ?? "",
      status: job.status ?? "",
      date: formatDate(job.created_at),
      location: getLocationLabel(job.location),
    }));
  }, [role, bookingsResult, jobsResult, reviewsResult]);

  const reviews = useMemo(() => {
    return (reviewsResult?.data ?? []).map((review) => {
      const reviewer = Array.isArray(review.reviewer)
        ? review.reviewer[0]
        : review.reviewer;
      return {
        id: review.id,
        name: reviewer?.full_name ?? "Reviewer",
        rating: review.rating ?? 0,
        comment: review.comment ?? "",
        date: formatDate(review.created_at),
      };
    });
  }, [reviewsResult]);

  return (
    <div className="space-y-6 py-6 max-w-5xl">
      <PageHeader title={displayName || "Profile"} backTo={-1} />

      {/* Hero card */}
      <Card className="overflow-hidden border border-[#F7C876]/30 shadow-sm">
        <div className="bg-gradient-to-br from-[#FEF3DB] to-white px-6 py-6 border-b border-[#F7C876]/30">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar className="h-20 w-20 ring-4 ring-white shadow-md shrink-0">
              {avatarUrl && <AvatarImage src={avatarUrl} />}
              <AvatarFallback className="bg-[#F7C876] text-white text-2xl font-bold">
                {getInitials(displayName || "User")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {displayName || "Profile"}
                </h2>
                <Badge
                  className={
                    role === "provider"
                      ? "bg-[#F7C876]/30 text-[#C17A00] border-[#F7C876]/50"
                      : "bg-blue-50 text-blue-700 border-blue-100"
                  }
                >
                  {role === "provider" ? "Service Provider" : "Client"}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {location}
                  </span>
                )}
                {memberSince && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Member since {memberSince}
                  </span>
                )}
              </div>
            </div>
            {rating > 0 && (
              <div className="flex flex-col items-center gap-0.5 rounded-xl bg-white border border-[#F7C876]/40 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xl font-bold text-gray-900">
                    {rating}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Rating</span>
              </div>
            )}
          </div>
        </div>

        {isProfileLoading && (
          <CardContent className="py-4">
            <p className="text-sm text-gray-500">Loading profile...</p>
          </CardContent>
        )}

        {role === "provider" && (
          <CardContent className="py-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <Briefcase className="h-5 w-5 text-[#C17A00] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Jobs Done
                  </p>
                  <p className="font-semibold text-gray-900">
                    {providerProfileResult?.data?.jobs_completed ?? 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                <Star className="h-5 w-5 text-[#C17A00] shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
                    Reviews
                  </p>
                  <p className="font-semibold text-gray-900">
                    {providerProfileResult?.data?.total_reviews ?? 0}
                  </p>
                </div>
              </div>
              {providerProfileResult?.data?.bio && (
                <div className="col-span-2 sm:col-span-3 rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    About
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {providerProfileResult.data.bio}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <p className="text-sm text-gray-500">No jobs found.</p>
          ) : (
            jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-1 rounded-lg border border-gray-100 hover:border-[#F7C876]/60 transition-colors p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {job.title}
                  </h3>
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                    {job.status?.replace("_", " ")}
                  </Badge>
                </div>
                {job.subtitle && (
                  <p className="text-sm text-gray-500">{job.subtitle}</p>
                )}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mt-0.5">
                  {job.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {job.date}
                    </span>
                  )}
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {job.location}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Reviews */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-gray-100 hover:border-[#F7C876]/60 transition-colors p-4"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {review.name}
                  </p>
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-gray-700">
                      {review.rating}
                    </span>
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {review.comment}
                  </p>
                )}
                {review.date && (
                  <p className="text-xs text-gray-400 mt-1.5">{review.date}</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
