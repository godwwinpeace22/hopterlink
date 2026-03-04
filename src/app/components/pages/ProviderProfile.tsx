import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
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
} from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ProviderProfileProps {
  data?: any;
}

// Mock provider data
const mockProvider = {
  id: "p1",
  name: "John Martinez",
  businessName: "Martinez Handyman Services",
  rating: 4.8,
  totalReviews: 127,
  completedJobs: 234,
  hourlyRate: 45,
  avatar: "",
  services: [
    "Plumbing",
    "Electrical",
    "Carpentry",
    "Painting",
    "Drywall",
    "Tile Work",
  ],
  serviceArea: "Springfield & 15 mile radius",
  responseTime: "< 1 hour",
  verified: true,
  available: true,
  memberSince: "2020",
  bio: "Professional handyman with 15+ years of experience. Specializing in residential repairs and home improvements. I take pride in delivering quality workmanship and excellent customer service. Licensed, bonded, and insured.",
  certifications: [
    "Licensed Contractor #12345",
    "EPA Lead-Safe Certified",
    "OSHA 10-Hour Safety",
    "General Liability Insurance",
  ],
  portfolio: [
    {
      id: 1,
      title: "Kitchen Renovation",
      category: "Carpentry",
      image:
        "https://images.unsplash.com/photo-1556911220-bff31c812dba?w=400&h=300&fit=crop",
    },
    {
      id: 2,
      title: "Bathroom Remodel",
      category: "Plumbing",
      image:
        "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      title: "Deck Installation",
      category: "Carpentry",
      image:
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop",
    },
    {
      id: 4,
      title: "Interior Painting",
      category: "Painting",
      image:
        "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=400&h=300&fit=crop",
    },
    {
      id: 5,
      title: "Electrical Panel Upgrade",
      category: "Electrical",
      image:
        "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=300&fit=crop",
    },
    {
      id: 6,
      title: "Tile Backsplash",
      category: "Tile Work",
      image:
        "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop",
    },
  ],
  reviews: [
    {
      id: 1,
      client: "Robert Wilson",
      rating: 5,
      date: "2024-12-23",
      service: "Door Installation",
      comment:
        "Excellent work! Very professional and finished ahead of schedule. John was punctual, respectful of my home, and cleaned up thoroughly after the job. I highly recommend his services!",
      verified: true,
    },
    {
      id: 2,
      client: "Lisa Anderson",
      rating: 5,
      date: "2024-12-21",
      service: "Bathroom Tile Repair",
      comment:
        "Great attention to detail. The tiles look perfect now. John matched the grout color exactly and the repair is seamless. Will definitely hire again!",
      verified: true,
    },
    {
      id: 3,
      client: "James Brown",
      rating: 4,
      date: "2024-12-18",
      service: "Electrical Outlet Installation",
      comment:
        "Good work, though he arrived a bit late. Otherwise very satisfied with the service. The outlets work perfectly and everything is up to code.",
      verified: true,
    },
    {
      id: 4,
      client: "Maria Garcia",
      rating: 5,
      date: "2024-12-15",
      service: "Kitchen Cabinet Repair",
      comment:
        "John is a true professional! He fixed my cabinet doors and they work like new. Fair pricing and excellent communication throughout the project.",
      verified: true,
    },
    {
      id: 5,
      client: "David Chen",
      rating: 5,
      date: "2024-12-10",
      service: "Fence Repair",
      comment:
        "Outstanding service! John repaired several fence posts and reinforced the entire structure. Very knowledgeable and honest about what needed to be done.",
      verified: true,
    },
  ],
  availability: {
    "2024-12-27": ["9:00 AM", "10:00 AM", "2:00 PM"],
    "2024-12-28": ["8:00 AM", "9:00 AM", "3:00 PM"],
    "2024-12-30": ["10:00 AM", "11:00 AM", "1:00 PM", "4:00 PM"],
  },
};

type ProviderProfileData = Omit<
  typeof mockProvider,
  "reviews" | "availability"
> & {
  reviews: Array<{
    id: number;
    client: string;
    rating: number;
    date: string;
    service: string;
    comment: string;
    verified: boolean;
  }>;
  availability: Record<string, string[]>;
};

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
  const providerId = data?.providerId as string | undefined;
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [provider, setProvider] = useState<ProviderProfileData>(mockProvider);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const ratingDistribution = useMemo(() => {
    if (provider.reviews.length === 0) {
      return {
        5: 89,
        4: 28,
        3: 7,
        2: 2,
        1: 1,
      };
    }

    return provider.reviews.reduce(
      (acc, review) => {
        const rating = Math.max(1, Math.min(5, Math.round(review.rating)));
        acc[rating as 1 | 2 | 3 | 4 | 5] += 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    );
  }, [provider.reviews]);

  const totalReviewCount = useMemo(
    () => Math.max(provider.totalReviews ?? 0, provider.reviews.length),
    [provider.totalReviews, provider.reviews.length],
  );

  const distributionTotal = useMemo(
    () =>
      Object.values(ratingDistribution).reduce((sum, count) => sum + count, 0),
    [ratingDistribution],
  );

  useEffect(() => {
    if (!providerId) {
      setErrorMessage("No provider selected.");
      return;
    }

    const fetchProvider = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const [profileResult, reviewsResult] = await Promise.all([
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
          .eq("user_id", providerId)
          .single(),
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
          .eq("reviewee_id", providerId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (profileResult.error) {
        setErrorMessage(profileResult.error.message);
        setIsLoading(false);
        return;
      }

      const data = profileResult.data;
      const memberSince = data.profile?.created_at
        ? new Date(data.profile.created_at).getFullYear().toString()
        : mockProvider.memberSince;
      const serviceArea = data.service_areas?.join(", ") ?? "Local area";
      const availabilitySource =
        data.availability &&
        typeof data.availability === "object" &&
        !Array.isArray(data.availability) &&
        "dates" in data.availability
          ? ((data.availability as { dates?: Record<string, unknown> }).dates ??
            {})
          : ((data.availability as Record<string, unknown>) ?? {});
      const availabilityKeys = Object.keys(availabilitySource ?? {}).filter(
        (key) => /^\d{4}-\d{2}-\d{2}$/.test(key),
      );

      const mappedReviews = (reviewsResult.data ?? []).map((review, index) => ({
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
                mappedReviews.reduce((sum, review) => sum + review.rating, 0) /
                mappedReviews.length
              ).toFixed(1),
            )
          : 0;

      const portfolioUrls = data.portfolio_urls ?? [];
      const mappedPortfolio = portfolioUrls.map((url, index) => ({
        id: index + 1,
        title: `Portfolio ${index + 1}`,
        category: data.services?.[0] ?? "Work",
        image: url,
      }));

      setProvider({
        ...mockProvider,
        id: data.user_id,
        name: data.profile?.full_name ?? mockProvider.name,
        businessName:
          data.business_name ??
          data.profile?.full_name ??
          mockProvider.businessName,
        rating:
          data.rating && data.rating > 0 ? data.rating : calculatedRating || 0,
        totalReviews: data.total_reviews ?? 0,
        completedJobs: data.jobs_completed ?? 0,
        hourlyRate: data.hourly_rate ?? 0,
        avatar: data.profile?.avatar_url ?? "",
        services: data.services ?? [],
        serviceArea,
        responseTime: data.response_time
          ? `${data.response_time} mins`
          : mockProvider.responseTime,
        verified: data.verification_status === "approved",
        available: availabilityKeys.length > 0,
        memberSince,
        bio: data.bio ?? "",
        certifications: data.certifications ?? [],
        portfolio: mappedPortfolio,
        reviews: mappedReviews,
        availability: parseAvailability(data.availability),
      });

      setIsLoading(false);
    };

    fetchProvider();
  }, [providerId]);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => navigate("/dashboard/client/providers")}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Search</span>
          </button>
          <div className="flex items-center gap-2"></div>
        </div>
      </header>

      <div className="border-b bg-muted/30 py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-28 w-28 border-2 border-border shadow-sm">
              <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                {provider.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-foreground">
                  {provider.name}
                </h1>
                {provider.verified && (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                )}
              </div>
              <p className="mb-4 text-lg text-muted-foreground">
                {provider.businessName}
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-card-foreground">
                  <Star className="h-5 w-5 fill-primary text-primary" />
                  <span className="font-bold">{provider.rating}</span>
                  <span>({totalReviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-card-foreground">
                  <Briefcase className="h-5 w-5" />
                  <span>{provider.completedJobs} jobs completed</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-card-foreground">
                  <Award className="h-5 w-5" />
                  <span>Member since {provider.memberSince}</span>
                </div>
              </div>

              {provider.available && (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 px-4 py-2 text-base text-primary"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Available Now
                </Badge>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() =>
                  navigate("/dashboard/client/booking", {
                    state: { providerId: provider.id },
                  })
                }
                className="text-base px-6 py-5"
              >
                <Calendar className="h-5 w-5 mr-2" />
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
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        {errorMessage && (
          <Card className="mb-6">
            <CardContent className="py-6">
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errorMessage}
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center text-muted-foreground">
              Loading provider profile...
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-muted-foreground">
                  {provider.bio}
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="portfolio" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="portfolio">
                  Portfolio ({provider.portfolio.length})
                </TabsTrigger>
                <TabsTrigger value="reviews">
                  Reviews ({provider.reviews.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {provider.portfolio.map((item) => (
                    <div
                      key={item.id}
                      className="group relative cursor-pointer overflow-hidden rounded-lg border border-border shadow-sm transition-shadow hover:shadow-md"
                      onClick={() => setSelectedImage(item.id)}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <p className="font-semibold">{item.title}</p>
                          <p className="text-sm text-white/80">
                            {item.category}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {provider.portfolio.length === 0 && (
                  <div className="py-12 text-center text-muted-foreground">
                    No portfolio items yet
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 space-y-6">
                <Card className="border-border bg-card shadow-sm">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="text-center">
                        <div className="mb-2 text-6xl font-bold text-foreground">
                          {provider.rating}
                        </div>
                        <div className="flex items-center justify-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-6 w-6 ${star <= Math.floor(provider.rating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground">
                          {totalReviewCount} total reviews
                        </p>
                      </div>

                      <div className="space-y-2">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-3">
                            <span className="text-sm font-medium w-12">
                              {rating} star
                            </span>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{
                                  width: `${(ratingDistribution[rating as keyof typeof ratingDistribution] / (distributionTotal || 1)) * 100}%`,
                                }}
                              />
                            </div>
                            <span className="w-12 text-right text-sm text-muted-foreground">
                              {
                                ratingDistribution[
                                  rating as keyof typeof ratingDistribution
                                ]
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {provider.reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="border-border bg-card shadow-sm"
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground">
                              {review.client
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-foreground">
                                {review.client}
                              </p>
                              {review.verified && (
                                <Badge
                                  variant="outline"
                                  className="border-primary/30 bg-primary/5 text-primary"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {review.service}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${star <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {review.date}
                          </p>
                        </div>
                      </div>
                      <p className="leading-relaxed text-muted-foreground">
                        {review.comment}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Hourly Rate</p>
                    <p className="font-bold text-foreground">
                      ${provider.hourlyRate}/hour
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Response Time
                    </p>
                    <p className="font-bold text-foreground">
                      {provider.responseTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Service Area
                    </p>
                    <p className="font-bold text-foreground">
                      {provider.serviceArea}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {provider.services.map((service) => (
                    <Badge key={service} variant="secondary">
                      {service}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Certifications & Insurance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {provider.certifications.map((cert, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        {cert}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardContent className="pt-6">
                <h3 className="mb-2 text-xl font-bold text-foreground">
                  Ready to Book?
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {provider.name} is available and ready to help with your
                  project.
                </p>
                <Button
                  onClick={() =>
                    navigate("/dashboard/client/booking", {
                      state: { providerId: provider.id },
                    })
                  }
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            ×
          </button>
          <img
            src={provider.portfolio.find((p) => p.id === selectedImage)?.image}
            alt="Portfolio item"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
