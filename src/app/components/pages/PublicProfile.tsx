import { useMemo } from "react";
import { useParams } from "react-router-dom";
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
import { Star } from "lucide-react";

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
    if (role !== "client") return [];
    return (jobsResult?.data ?? []).map((job) => ({
      id: job.id,
      title: job.title ?? "Job",
      subtitle: job.category ?? "",
      status: job.status ?? "",
      date: formatDate(job.created_at),
      location: getLocationLabel(job.location),
    }));
  }, [role, jobsResult]);

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
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                {avatarUrl && <AvatarImage src={avatarUrl} />}
                <AvatarFallback className="bg-blue-600 text-white text-lg">
                  {getInitials(displayName || "User")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {displayName || "Profile"}
                </h2>
                <p className="text-sm text-gray-600">
                  {role === "provider" ? "Provider" : "Client"}
                  {memberSince ? ` • Member since ${memberSince}` : ""}
                </p>
                {location && (
                  <p className="text-sm text-gray-500">{location}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {rating || "—"}
                </span>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border-blue-100">
                Rating
              </Badge>
            </div>
          </div>

          {isProfileLoading && (
            <p className="text-sm text-gray-600">Loading profile...</p>
          )}

          {role === "provider" && (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Completed Jobs</p>
                <p className="font-medium text-gray-900">
                  {providerProfileResult?.data?.jobs_completed ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Total Reviews</p>
                <p className="font-medium text-gray-900">
                  {providerProfileResult?.data?.total_reviews ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-sm text-gray-500">Bio</p>
                <p className="text-sm text-gray-700">
                  {providerProfileResult?.data?.bio ?? "—"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {role === "client" && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobs.length === 0 ? (
              <p className="text-sm text-gray-500">No jobs found.</p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex flex-col gap-1 rounded-lg border border-gray-100 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      {job.status?.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{job.subtitle}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span>{job.date}</span>
                    {job.location && <span>{job.location}</span>}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-lg border border-gray-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-900">{review.name}</p>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {review.rating}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
                <p className="text-xs text-gray-400">{review.date}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};
