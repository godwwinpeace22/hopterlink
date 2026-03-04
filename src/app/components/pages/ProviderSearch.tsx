import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Search,
  MapPin,
  Star,
  DollarSign,
  Filter,
  CheckCircle,
  Clock,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  ALL_SERVICES_CATEGORY,
  PROVIDER_SEARCH_CATEGORIES,
} from "@/app/config/providerSearchCategories";

interface ProviderSearchProps {}

type Provider = {
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
  bio: string;
  nextAvailable: string;
};

export function ProviderSearch({}: ProviderSearchProps) {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("Springfield");
  const [selectedCategory, setSelectedCategory] = useState(
    ALL_SERVICES_CATEGORY,
  );
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRate: 1000,
    availableNow: false,
    verifiedOnly: false,
  });

  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      setErrorMessage(null);

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
          profile:profiles!provider_profiles_user_id_fkey (
            full_name,
            avatar_url
          )
        `,
        )
        .eq("verification_status", "approved")
        .order("rating", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const mappedProviders: Provider[] = (data ?? []).map((provider) => {
        const serviceArea = provider.service_areas?.join(", ") ?? "Local area";
        const availabilityKeys = provider.availability
          ? Object.keys(provider.availability)
          : [];
        const nextAvailable =
          availabilityKeys.length > 0 ? availabilityKeys[0] : "Flexible";
        const profile = Array.isArray(provider.profile)
          ? provider.profile[0]
          : provider.profile;

        return {
          id: provider.user_id,
          name: profile?.full_name ?? "Service Provider",
          businessName:
            provider.business_name ?? profile?.full_name ?? "Service Provider",
          rating: provider.rating ?? 0,
          totalReviews: provider.total_reviews ?? 0,
          completedJobs: provider.jobs_completed ?? 0,
          hourlyRate: provider.hourly_rate ?? 0,
          avatar: profile?.avatar_url ?? "",
          services: provider.services ?? [],
          serviceArea,
          responseTime: "< 2 hours",
          verified: provider.verification_status === "approved",
          available: availabilityKeys.length > 0,
          bio: provider.bio ?? "",
          nextAvailable,
        };
      });

      setProviders(mappedProviders);
      setIsLoading(false);
    };

    fetchProviders();
  }, []);

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const matchesSearch =
          searchQuery === "" ||
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.businessName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          provider.services.some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase()),
          );

        const matchesCategory =
          selectedCategory === ALL_SERVICES_CATEGORY ||
          provider.services.some((s) =>
            s.toLowerCase().includes(selectedCategory.toLowerCase()),
          );

        const matchesRating = provider.rating >= filters.minRating;
        const matchesRate = provider.hourlyRate <= filters.maxRate;
        const matchesAvailable = !filters.availableNow || provider.available;
        const matchesVerified = !filters.verifiedOnly || provider.verified;

        return (
          matchesSearch &&
          matchesCategory &&
          matchesRating &&
          matchesRate &&
          matchesAvailable &&
          matchesVerified
        );
      }),
    [providers, searchQuery, selectedCategory, filters],
  );

  const renderProviderCard = (provider: Provider) => (
    <Card
      key={provider.id}
      className="border-border bg-card transition-shadow hover:shadow-md"
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20 flex-shrink-0">
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {provider.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-xl text-foreground">
                    {provider.name}
                  </h3>
                  {provider.verified && (
                    <CheckCircle className="h-5 w-5 text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {provider.businessName}
                </p>
              </div>
              {provider.available && (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/5 text-primary"
                >
                  Available Now
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(provider.rating) ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                  />
                ))}
                <span className="ml-1 font-bold text-foreground">
                  {provider.rating}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({provider.totalReviews} reviews)
                </span>
              </div>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">
                {provider.completedJobs} jobs completed
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {provider.services.map((service) => (
                <Badge key={service} variant="secondary">
                  {service}
                </Badge>
              ))}
            </div>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {provider.bio}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                <span>
                  <strong>${provider.hourlyRate}/hr</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Responds in {provider.responseTime}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{provider.serviceArea}</span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <CheckCircle className="h-4 w-4" />
                <span>Next: {provider.nextAvailable}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() =>
                  navigate("/dashboard/client/providers/profile", {
                    state: { providerId: provider.id },
                  })
                }
                className="flex-1"
              >
                View Profile
              </Button>
              <Button
                onClick={() =>
                  navigate("/dashboard/client/booking", {
                    state: { providerId: provider.id },
                  })
                }
                variant="secondary"
                className="flex-1"
              >
                Book Now
              </Button>
              <Button
                variant="outline"
                onClick={() => alert("Message feature coming soon!")}
              >
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-muted/40 py-10">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Find Local Service Providers
          </h1>
          <p className="text-muted-foreground mb-6">
            Search from {providers.length} verified professionals in your area
          </p>

          <Card className="border-border bg-card p-4 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search services or providers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <Button className="w-full" disabled={isLoading}>
                  <Search className="h-4 w-4 mr-2" />
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-foreground">
            Browse by Category
          </h2>
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-max gap-3">
              {PROVIDER_SEARCH_CATEGORIES.map((category) => {
                const isSelected = selectedCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters and Results */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Minimum Rating
                  </label>
                  <select
                    value={filters.minRating}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        minRating: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-md border border-border bg-background p-2"
                  >
                    <option value={0}>Any Rating</option>
                    <option value={4}>4+ Stars</option>
                    <option value={4.5}>4.5+ Stars</option>
                    <option value={4.8}>4.8+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Max Hourly Rate
                  </label>
                  <Input
                    type="number"
                    value={filters.maxRate}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        maxRate: Number(e.target.value),
                      })
                    }
                    placeholder="Max $"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Current: ${filters.maxRate}/hr
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Available Now</label>
                  <input
                    type="checkbox"
                    checked={filters.availableNow}
                    onChange={(e) =>
                      setFilters({ ...filters, availableNow: e.target.checked })
                    }
                    className="h-5 w-5"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Verified Only</label>
                  <input
                    type="checkbox"
                    checked={filters.verifiedOnly}
                    onChange={(e) =>
                      setFilters({ ...filters, verifiedOnly: e.target.checked })
                    }
                    className="h-5 w-5"
                  />
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() =>
                    setFilters({
                      minRating: 0,
                      maxRate: 1000,
                      availableNow: false,
                      verifiedOnly: false,
                    })
                  }
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {filteredProviders.length} Providers Found
                </h2>
                <p className="text-muted-foreground">
                  Showing results for "{selectedCategory}" in {location}
                </p>
              </div>
            </div>

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
                  Loading providers...
                </CardContent>
              </Card>
            )}

            {filteredProviders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="mb-2 text-xl font-bold text-foreground">
                    No providers found
                  </h3>
                  <p className="mb-4 text-muted-foreground">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(ALL_SERVICES_CATEGORY);
                      setFilters({
                        minRating: 0,
                        maxRate: 1000,
                        availableNow: false,
                        verifiedOnly: false,
                      });
                    }}
                  >
                    Clear All Filters
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredProviders.map((provider) =>
                  renderProviderCard(provider),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
