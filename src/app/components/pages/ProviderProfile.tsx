import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Star,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  ArrowLeft,
  Calendar,
  Shield,
  Award,
  MessageSquare,
  Briefcase,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";

interface ProviderProfileProps {
  data?: any;
}

interface ProviderReview {
  id: number;
  client: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  verified: boolean;
}

interface ProviderProfileData {
  id: string;
  name: string;
  businessName: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  hourlyRate: number;
  avatar: string;
  services: string[];
  serviceArea: string;
  responseTime: string;
  verified: boolean;
  available: boolean;
  memberSince: string;
  bio: string;
  certifications: string[];
  portfolio: { id: number; title: string; category: string; image: string }[];
  reviews: ProviderReview[];
  availability: Record<string, string[]>;
}

const parseAvailability = (value: unknown): Record<string, string[]> => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const source = value as Record<string, unknown>;
  const datesSource =
    source.dates &&
    typeof source.dates === "object" &&
    !Array.isArray(source.dates)
      ? (source.dates as Record<string, unknown>)
      : source;

  return Object.entries(datesSource).reduce(
    (acc, [dateKey, slots]) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        return acc;
      }

      if (Array.isArray(slots)) {
        const normalized = slots
          .map((slot) =>
            typeof slot === "string" ? slot.trim() : slot == null ? "" : "",
          )
          .filter(Boolean);

        if (normalized.length > 0) {
          acc[dateKey] = normalized;
        }
        return acc;
      }

      if (typeof slots === "string" && slots.trim()) {
        acc[dateKey] = [slots.trim()];
      }

      return acc;
    },
    {} as Record<string, string[]>,
  );
};

export function ProviderProfile({ data }: ProviderProfileProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const providerId = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchProviderId = searchParams.get("providerId") ?? undefined;

    if (typeof window === "undefined") {
      return (data?.providerId as string | undefined) ?? searchProviderId;
    }

    const id =
      (data?.providerId as string | undefined) ??
      searchProviderId ??
      window.sessionStorage.getItem("providerProfileId") ??
      undefined;

    if (id) window.sessionStorage.setItem("providerProfileId", id);
    return id;
  }, [data?.providerId, location.search]);

  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const {
    data: profileResult,
    isLoading: profileLoading,
    error: profileError,
  } = useSupabaseQuery(
    ["provider_profile", providerId],
    () =>
      supabase
        .from("provider_profiles")
        .select(
          `
          user_id,
          business_name,
          bio,
          services,
          service_areas,
          hourly_rate,
          rating,
          total_reviews,
          jobs_completed,
          response_time,
          verification_status,
          portfolio_urls,
          certifications,
          availability,
          profile:profiles!provider_profiles_user_id_fkey (
            full_name,
            avatar_url,
            created_at
          )
        `,
        )
        .eq("user_id", providerId!)
        .single(),
    { enabled: Boolean(providerId) },
  );

  const { data: reviewsResult, isLoading: reviewsLoading } = useSupabaseQuery(
    ["provider_reviews", providerId],
    () =>
      supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          is_verified,
          booking:bookings (
            service_type
          ),
          reviewer:profiles!reviews_reviewer_id_fkey (
            full_name
          )
        `,
        )
        .eq("reviewee_id", providerId!)
        .order("created_at", { ascending: false })
        .limit(10),
    { enabled: Boolean(providerId) },
  );

  const isLoading = profileLoading || reviewsLoading;

  const provider = useMemo<ProviderProfileData | null>(() => {
    const raw = profileResult?.data;
    if (!raw) return null;

    const memberSince = raw.profile?.created_at
      ? new Date(raw.profile.created_at).getFullYear().toString()
      : "";
    const serviceArea = raw.service_areas?.join(", ") ?? "Local area";
    const availabilitySource =
      raw.availability &&
      typeof raw.availability === "object" &&
      !Array.isArray(raw.availability) &&
      "dates" in raw.availability
        ? ((raw.availability as { dates?: Record<string, unknown> }).dates ??
          {})
        : ((raw.availability as Record<string, unknown>) ?? {});
    const availabilityKeys = Object.keys(availabilitySource ?? {}).filter(
      (key) => /^\d{4}-\d{2}-\d{2}$/.test(key),
    );

    const mappedReviews = (reviewsResult?.data ?? []).map((review, index) => ({
      id: Number(review.id) || index + 1,
      client: review.reviewer?.full_name ?? "Client",
      rating: review.rating ?? 0,
      date: review.created_at
        ? new Date(review.created_at).toLocaleDateString()
        : "",
      service: review.booking?.service_type ?? "Service",
      comment: review.comment ?? "",
      verified: Boolean(review.is_verified),
    }));

    const calculatedRating =
      mappedReviews.length > 0
        ? Number(
            (
              mappedReviews.reduce((sum, r) => sum + r.rating, 0) /
              mappedReviews.length
            ).toFixed(1),
          )
        : 0;

    const portfolioUrls = raw.portfolio_urls ?? [];
    const mappedPortfolio = portfolioUrls.map((url, index) => ({
      id: index + 1,
      title: `Portfolio ${index + 1}`,
      category: raw.services?.[0] ?? "Work",
      image: url,
    }));

    return {
      id: raw.user_id,
      name: raw.profile?.full_name ?? raw.business_name ?? "Provider",
      businessName:
        raw.business_name ?? raw.profile?.full_name ?? "Service Provider",
      rating: raw.rating && raw.rating > 0 ? raw.rating : calculatedRating || 0,
      totalReviews: raw.total_reviews ?? 0,
      completedJobs: raw.jobs_completed ?? 0,
      hourlyRate: raw.hourly_rate ?? 0,
      avatar: raw.profile?.avatar_url ?? "",
      services: raw.services ?? [],
      serviceArea,
      responseTime: raw.response_time
        ? `${raw.response_time} mins`
        : "Within a day",
      verified: raw.verification_status === "approved",
      available: availabilityKeys.length > 0,
      memberSince,
      bio: raw.bio ?? "",
      certifications: raw.certifications ?? [],
      portfolio: mappedPortfolio,
      reviews: mappedReviews,
      availability: parseAvailability(raw.availability),
    };
  }, [profileResult?.data, reviewsResult?.data]);

  const ratingDistribution = useMemo(() => {
    if (!provider || provider.reviews.length === 0) {
      return { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    }
    return provider.reviews.reduce(
      (acc, review) => {
        const rating = Math.max(1, Math.min(5, Math.round(review.rating)));
        acc[rating as 1 | 2 | 3 | 4 | 5] += 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    );
  }, [provider?.reviews]);

  const totalReviewCount = useMemo(
    () => Math.max(provider?.totalReviews ?? 0, provider?.reviews.length ?? 0),
    [provider?.totalReviews, provider?.reviews.length],
  );

  const distributionTotal = useMemo(
    () =>
      Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0),
    [ratingDistribution],
  );

  const errorMessage = !providerId
    ? "No provider selected."
    : ((profileError as { message?: string } | null)?.message ?? null);

  return (
    <div className="min-w-0">
      {/* Header */}
      <header className="z-50 sticky top-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 -mx-6 lg:-mx-8 px-6 lg:px-8">
        <div className="flex h-13 items-center py-3">
          <button
            onClick={() => navigate("/dashboard/client/providers")}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Search
          </button>
        </div>
      </header>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="py-8 space-y-6">
          <div className="border-b bg-gradient-to-b from-primary/5 to-transparent py-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Skeleton className="h-24 w-24 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Skeleton className="h-9 w-36 rounded-md" />
                <Skeleton className="h-9 w-36 rounded-md" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </div>
          </div>
        </div>
      )}

      {errorMessage && !isLoading && (
        <div className="py-12">
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {errorMessage}
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && !provider && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Briefcase className="h-7 w-7 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-1">
            Provider not found
          </h2>
          <p className="text-sm text-muted-foreground">
            The profile you're looking for doesn't exist or has been removed.
          </p>
        </div>
      )}

      {provider && (
        <>
          {/* Hero */}
          <div className="border-b bg-gradient-to-b from-primary/5 to-transparent py-8 -mx-6 lg:-mx-8 px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              {/* Avatar with availability dot */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                  {provider.avatar && (
                    <AvatarImage src={provider.avatar} alt={provider.name} />
                  )}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-semibold">
                    {provider.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {provider.available && (
                  <span className="absolute bottom-1.5 right-1.5 h-4 w-4 rounded-full bg-green-500 ring-2 ring-background" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-foreground tracking-tight">
                    {provider.name}
                  </h1>
                  {provider.verified && (
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  )}
                </div>

                {provider.businessName !== provider.name && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {provider.businessName}
                  </p>
                )}

                <p className="text-2xl font-bold text-primary mb-3">
                  ${provider.hourlyRate}
                  <span className="text-sm font-normal text-muted-foreground">
                    /hr
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3.5 w-3.5 ${
                          star <= Math.floor(provider.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted-foreground/30 text-muted-foreground/30"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-sm font-semibold text-foreground">
                      {provider.rating > 0 ? provider.rating.toFixed(1) : "New"}
                    </span>
                    {totalReviewCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({totalReviewCount} reviews)
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground/40 text-xs">•</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {provider.completedJobs} jobs
                  </span>
                  {provider.memberSince && (
                    <>
                      <span className="text-muted-foreground/40 text-xs">
                        •
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        Since {provider.memberSince}
                      </span>
                    </>
                  )}
                </div>

                {provider.available ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/10">
                    Available Now
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Currently Unavailable
                  </Badge>
                )}
              </div>

              <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-auto flex-shrink-0">
                <Button
                  onClick={() =>
                    navigate("/dashboard/client/booking", {
                      state: { providerId: provider.id },
                    })
                  }
                  className="flex-1 sm:flex-none sm:w-36"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate("/dashboard/client/messages", {
                      state: {
                        recipientId: provider.id,
                        recipientName: provider.name,
                        recipientAvatar: provider.avatar,
                        contextLabel: `Provider: ${provider.name}`,
                      },
                    })
                  }
                  className="flex-1 sm:flex-none sm:w-36"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left column */}
              <div className="lg:col-span-2 space-y-6">
                {provider.bio && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="leading-relaxed text-muted-foreground text-sm">
                        {provider.bio}
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Tabs defaultValue="reviews" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="portfolio">
                      Portfolio ({provider.portfolio.length})
                    </TabsTrigger>
                    <TabsTrigger value="reviews">
                      Reviews ({provider.reviews.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="portfolio" className="mt-6">
                    {provider.portfolio.length === 0 ? (
                      <div className="py-12 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          No portfolio items yet
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {provider.portfolio.map((item) => (
                          <div
                            key={item.id}
                            className="group relative cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            onClick={() => setSelectedImage(item.id)}
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-48 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <p className="text-sm font-semibold text-white">
                                  {item.title}
                                </p>
                                <p className="text-xs text-white/70">
                                  {item.category}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="reviews" className="mt-6 space-y-5">
                    {/* Rating summary */}
                    <Card className="border-border bg-card">
                      <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center">
                            <p className="text-5xl font-bold text-foreground mb-2">
                              {provider.rating > 0
                                ? provider.rating.toFixed(1)
                                : "—"}
                            </p>
                            <div className="flex items-center justify-center gap-1 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 ${
                                    star <= Math.floor(provider.rating)
                                      ? "fill-amber-400 text-amber-400"
                                      : "fill-muted-foreground/20 text-muted-foreground/20"
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {totalReviewCount} review
                              {totalReviewCount !== 1 ? "s" : ""}
                            </p>
                          </div>

                          <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count =
                                ratingDistribution[
                                  rating as keyof typeof ratingDistribution
                                ];
                              const pct =
                                (count / (distributionTotal || 1)) * 100;
                              return (
                                <div
                                  key={rating}
                                  className="flex items-center gap-3"
                                >
                                  <span className="text-xs text-muted-foreground w-8 text-right">
                                    {rating}★
                                  </span>
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                                    <div
                                      className="h-full rounded-full bg-amber-400 transition-all"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                  <span className="w-6 text-right text-xs text-muted-foreground">
                                    {count}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {provider.reviews.map((review) => (
                      <Card key={review.id} className="border-border bg-card">
                        <CardContent className="pt-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                  {review.client
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground">
                                    {review.client}
                                  </p>
                                  {review.verified && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs px-1.5 py-0 border-green-500/30 text-green-600"
                                    >
                                      <CheckCircle className="h-2.5 w-2.5 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {review.service}
                                </p>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="flex items-center gap-0.5 mb-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${
                                      star <= review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-muted-foreground/20 text-muted-foreground/20"
                                    }`}
                                  />
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {review.date}
                              </p>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {review.comment}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}

                    {provider.reviews.length === 0 && (
                      <div className="py-10 text-center">
                        <Star className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                        <p className="text-sm text-muted-foreground">
                          No reviews yet
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sticky sidebar */}
              <div className="self-start sticky top-14 space-y-4">
                {/* Quick info */}
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Hourly Rate
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          ${provider.hourlyRate}/hr
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                        <Clock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Response Time
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {provider.responseTime}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 flex-shrink-0">
                        <MapPin className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Service Area
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {provider.serviceArea}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Services */}
                {provider.services.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Services</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-1.5">
                        {provider.services.map((service) => (
                          <Badge
                            key={service}
                            variant="secondary"
                            className="text-xs"
                          >
                            {service}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Certifications */}
                {provider.certifications.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Shield className="h-4 w-4 text-primary" />
                        Certifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {provider.certifications.map((cert, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span className="text-xs text-muted-foreground leading-relaxed">
                              {cert}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {/* CTA card */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="pt-5 pb-5">
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      Ready to Book?
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {provider.name.split(" ")[0]} is{" "}
                      {provider.available
                        ? "available now"
                        : "accepting bookings"}
                      .
                    </p>
                    <Button
                      onClick={() =>
                        navigate("/dashboard/client/booking", {
                          state: { providerId: provider.id },
                        })
                      }
                      className="w-full"
                      size="sm"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Image lightbox */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedImage(null)}
            >
              <button
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={
                  provider.portfolio.find((p) => p.id === selectedImage)?.image
                }
                alt="Portfolio item"
                className="max-w-full max-h-full object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
