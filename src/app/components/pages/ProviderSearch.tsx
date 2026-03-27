import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "@/lib/router";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Search,
  MapPin,
  Star,
  DollarSign,
  CheckCircle,
  Clock,
  Briefcase,
  Zap,
  Palette,
  Code,
  Layers,
  Wrench,
  Sparkles,
  PaintBucket,
  Leaf,
  Hammer,
  LayoutDashboard,
  SlidersHorizontal,
  Users,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useServiceCategories } from "@/lib/useServiceCategories";
import { useAuth } from "@/contexts/AuthContext";
import { normalizeCountryCode } from "@/app/lib/countryConfig";

interface ProviderSearchProps {}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "All Services": <LayoutDashboard className="h-4 w-4" />,
  "Graphics Design": <Palette className="h-4 w-4" />,
  "UI/UX Design": <Layers className="h-4 w-4" />,
  "Web Development": <Code className="h-4 w-4" />,
  "Product Design": <Briefcase className="h-4 w-4" />,
  Plumbing: <Wrench className="h-4 w-4" />,
  Electrical: <Zap className="h-4 w-4" />,
  Cleaning: <Sparkles className="h-4 w-4" />,
  Painting: <PaintBucket className="h-4 w-4" />,
  Landscaping: <Leaf className="h-4 w-4" />,
  Carpentry: <Hammer className="h-4 w-4" />,
};

type Provider = {
  id: string;
  name: string;
  businessName: string;
  country: string | null;
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
  const routerLocation = useLocation();
  const { t } = useTranslation();
  const { profile, user, isLoading: isAuthLoading } = useAuth();
  const { categoryNamesWithAll, ALL_SERVICES_LABEL } = useServiceCategories();
  const userCountry = normalizeCountryCode(profile?.country);
  const hasUserCountry = userCountry.length > 0;
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(ALL_SERVICES_LABEL);
  const [isFiltersMobileOpen, setIsFiltersMobileOpen] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRate: null as number | null,
    availableNow: false,
    verifiedOnly: false,
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(routerLocation.search);
    setSearchQuery(searchParams.get("q") ?? "");
    setLocation(searchParams.get("location") ?? "");
  }, [routerLocation.search]);

  const handleSearch = () => {
    const searchParams = new URLSearchParams(routerLocation.search);

    if (searchQuery.trim()) {
      searchParams.set("q", searchQuery.trim());
    } else {
      searchParams.delete("q");
    }

    if (location.trim()) {
      searchParams.set("location", location.trim());
    } else {
      searchParams.delete("location");
    }

    const nextSearch = searchParams.toString();
    navigate(
      `${routerLocation.pathname}${nextSearch ? `?${nextSearch}` : ""}`,
      { replace: true },
    );
  };

  const {
    data: rawResult,
    isLoading,
    error,
  } = useSupabaseQuery(
    ["provider_profiles_search", userCountry],
    () => {
      let query = supabase
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
          profile:profiles!provider_profiles_user_id_fkey!inner (
            full_name,
            avatar_url,
            country
          )
        `,
        )
        .eq("verification_status", "approved");

      if (userCountry) {
        query = query.eq("profile.country", userCountry);
      }

      return query.order("rating", { ascending: false });
    },
    {
      enabled: !isAuthLoading && hasUserCountry,
    },
  );

  const providers = useMemo<Provider[]>(() => {
    return (rawResult?.data ?? []).map((provider) => {
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
        name: profile?.full_name ?? t("providerSearch.providerDefault"),
        businessName:
          provider.business_name ??
          profile?.full_name ??
          t("providerSearch.providerDefault"),
        rating: provider.rating ?? 0,
        totalReviews: provider.total_reviews ?? 0,
        completedJobs: provider.jobs_completed ?? 0,
        hourlyRate: provider.hourly_rate ?? 0,
        avatar: profile?.avatar_url ?? "",
        services: provider.services ?? [],
        serviceArea,
        responseTime: t("providerSearch.responseTimeDefault"),
        verified: provider.verification_status === "approved",
        available: availabilityKeys.length > 0,
        bio: provider.bio ?? "",
        nextAvailable,
        country: normalizeCountryCode(profile?.country),
      };
    });
  }, [rawResult?.data, t]);

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const matchesCountry =
          typeof userCountry === "string" &&
          userCountry.length > 0 &&
          provider.country === userCountry;

        if (!matchesCountry) {
          return false;
        }

        const matchesSearch =
          searchQuery === "" ||
          provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          provider.businessName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          provider.services.some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase()),
          );

        const matchesLocation =
          location === "" ||
          provider.serviceArea.toLowerCase().includes(location.toLowerCase());

        const matchesCategory =
          selectedCategory === ALL_SERVICES_LABEL ||
          provider.services.some((s) =>
            s.toLowerCase().includes(selectedCategory.toLowerCase()),
          );

        const matchesRating = provider.rating >= filters.minRating;
        const matchesRate =
          filters.maxRate === null || provider.hourlyRate <= filters.maxRate;
        const matchesAvailable = !filters.availableNow || provider.available;
        const matchesVerified = !filters.verifiedOnly || provider.verified;

        return (
          matchesSearch &&
          matchesLocation &&
          matchesCategory &&
          matchesRating &&
          matchesRate &&
          matchesAvailable &&
          matchesVerified
        );
      }),
    [providers, searchQuery, location, selectedCategory, filters, userCountry],
  );

  const renderSkeletonCard = () => (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          <div className="flex items-center sm:items-start gap-4 w-full sm:w-auto">
            <Skeleton className="h-14 w-14 sm:h-20 sm:w-20 rounded-full flex-shrink-0" />
            <div className="sm:hidden flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex-1 space-y-3 w-full">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 flex-1 rounded-md" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderProviderCard = (provider: Provider) => (
    <Card
      key={provider.id}
      className="border-border bg-card transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
          {/* Mobile Header: Avatar + Title area */}
          <div className="flex items-center sm:items-start gap-4 w-full sm:w-auto">
            <div className="relative flex-shrink-0">
              <Avatar className="h-14 w-14 sm:h-20 sm:w-20">
                {provider.avatar && (
                  <AvatarImage src={provider.avatar} alt={provider.name} />
                )}
                <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl font-semibold">
                  {provider.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {provider.available && (
                <span className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 h-3 w-3 sm:h-3.5 sm:w-3.5 rounded-full bg-green-500 ring-2 ring-card" />
              )}
            </div>

            {/* Mobile Only: Name & Rate next to Avatar */}
            <div className="flex-1 min-w-0 sm:hidden">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <h3 className="font-semibold text-base text-foreground leading-tight truncate max-w-[85%]">
                  {provider.name}
                </h3>
                {provider.verified && (
                  <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <p className="text-lg font-bold text-primary">
                  ${provider.hourlyRate}
                  <span className="text-xs font-normal text-muted-foreground">
                    /hr
                  </span>
                </p>
                {provider.available ? (
                  <Badge className="bg-green-500/10 text-green-600 border-green-500/30 text-[10px] px-1.5 py-0 h-5">
                    {t("providerSearch.availableNow")}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 h-5 text-muted-foreground"
                  >
                    {t("providerSearch.unavailable")}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 min-w-0 w-full">
            {/* Desktop Only: Name & Badges & Rate inside the flex column */}
            <div className="hidden sm:block">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg text-foreground leading-tight">
                    {provider.name}
                  </h3>
                  {provider.verified && (
                    <CheckCircle className="h-4.5 w-4.5 text-primary flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {provider.available ? (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/30 hover:bg-green-500/10 text-xs">
                      {t("providerSearch.availableNow")}
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-xs text-muted-foreground"
                    >
                      {t("providerSearch.unavailable")}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Rate prominent display */}
              <p className="text-2xl font-bold text-primary mb-3">
                ${provider.hourlyRate}
                <span className="text-sm font-normal text-muted-foreground">
                  /hr
                </span>
              </p>
            </div>

            {/* Rating + jobs row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3.5 w-3.5 ${star <= Math.floor(provider.rating) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30 fill-muted-foreground/30"}`}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-foreground">
                  {provider.rating > 0
                    ? provider.rating.toFixed(1)
                    : t("providerSearch.newLabel")}
                </span>
                {provider.totalReviews > 0 && (
                  <span className="text-xs text-muted-foreground">
                    ({provider.totalReviews})
                  </span>
                )}
              </div>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {provider.completedJobs} {t("providerSearch.jobs")}
              </span>
              <span className="text-muted-foreground/40 text-xs">•</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {provider.responseTime}
              </span>
            </div>

            {/* Services */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {provider.services.slice(0, 4).map((service) => (
                <Badge
                  key={service}
                  variant="secondary"
                  className="text-xs px-2 py-0.5"
                >
                  {service}
                </Badge>
              ))}
              {provider.services.length > 4 && (
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-0.5 text-muted-foreground"
                >
                  {t("providerSearch.moreServices", {
                    count: provider.services.length - 4,
                  })}
                </Badge>
              )}
            </div>

            {/* Bio */}
            {provider.bio && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
                {provider.bio}
              </p>
            )}

            {/* Location */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{provider.serviceArea}</span>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() =>
                  navigate("/dashboard/client/booking", {
                    state: { providerId: provider.id },
                  })
                }
                className="flex-1 sm:flex-none"
              >
                {t("providerSearch.bookNow")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  navigate("/dashboard/client/providers/profile", {
                    state: { providerId: provider.id },
                  })
                }
                className="flex-1 sm:flex-none"
              >
                {t("providerSearch.viewProfile")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  navigate("/dashboard/client/messages", {
                    state: {
                      recipientId: provider.id,
                      recipientName: provider.name,
                    },
                  })
                }
                className="flex-1 sm:flex-none text-primary hover:text-primary hover:bg-primary/10"
              >
                {t("providerSearch.message")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const activeFilterCount = [
    filters.minRating > 0,
    filters.maxRate !== null,
    filters.availableNow,
    filters.verifiedOnly,
  ].filter(Boolean).length;

  const inAreaProvidersCount = providers.length;
  const visibleProvidersCount = filteredProviders.length;
  const isPageLoading = isAuthLoading || (hasUserCountry && isLoading);

  return (
    <div className="w-full min-w-0 py-6">
      {/* Hero / Search header */}
      <div className="border-b -mx-6 -mt-8 lg:-mx-8 px-6 lg:px-8 py-10 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("providerSearch.title")}
          </h1>
        </div>
        <p className="text-muted-foreground mb-6">
          {isPageLoading
            ? t("providerSearch.loadingHero")
            : t("providerSearch.availableCount", {
                count: inAreaProvidersCount,
              })}
        </p>

        {hasUserCountry && (
          <p className="text-xs text-muted-foreground mb-4">
            {t("providerSearch.countryRestricted", { country: userCountry })}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap gap-4 mb-6">
          {[
            {
              icon: <Users className="h-4 w-4" />,
              label: t("providerSearch.statsProviders", {
                count: inAreaProvidersCount,
              }),
            },
            {
              icon: <CheckCircle className="h-4 w-4" />,
              label: t("providerSearch.statsVerified"),
            },
            {
              icon: <TrendingUp className="h-4 w-4" />,
              label: t("providerSearch.statsTopRated"),
            },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 text-sm text-muted-foreground bg-background/70 border border-border rounded-full px-3 py-1"
            >
              <span className="text-primary">{icon}</span>
              {label}
            </div>
          ))}
        </div>

        {/* Search bar */}
        <Card className="border-border bg-card shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("providerSearch.searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-4">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("providerSearch.locationPlaceholder")}
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-3">
                <Button
                  className="w-full"
                  disabled={isPageLoading}
                  onClick={handleSearch}
                >
                  <Search className="h-4 w-4 mr-2" />
                  {isPageLoading
                    ? t("providerSearch.searching")
                    : t("providerSearch.search")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="py-8">
        {/* Category pills */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {t("providerSearch.browseByCategory")}
          </h2>
          <div className="flex overflow-x-auto sm:flex-wrap gap-2 pb-2 sm:pb-0 -mx-2 px-2 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {categoryNamesWithAll.map((category) => {
              const isSelected = selectedCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-150 ${
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground hover:bg-primary/5"
                  }`}
                >
                  {CATEGORY_ICONS[category]}
                  {category}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Results */}
        <div className="flex flex-col lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsFiltersMobileOpen(!isFiltersMobileOpen)}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {isFiltersMobileOpen ? "Hide Filters" : t("providerSearch.filters")}
            {activeFilterCount > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] rounded-full">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filter sidebar */}
          <div
            className={`lg:col-span-1 self-start lg:sticky lg:top-4 relative z-0 ${isFiltersMobileOpen ? "block" : "hidden"} lg:block`}
          >
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-base">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {t("providerSearch.filters")}
                  </span>
                  {activeFilterCount > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
                      {activeFilterCount}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-5 pt-0">
                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t("providerSearch.minRating")}
                  </label>
                  <Select
                    value={String(filters.minRating)}
                    onValueChange={(v) =>
                      setFilters({ ...filters, minRating: Number(v) })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={t("providerSearch.anyRating")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">
                        {t("providerSearch.anyRating")}
                      </SelectItem>
                      <SelectItem value="4">
                        {t("providerSearch.stars4")}
                      </SelectItem>
                      <SelectItem value="4.5">
                        {t("providerSearch.stars45")}
                      </SelectItem>
                      <SelectItem value="4.8">
                        {t("providerSearch.stars48")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div>
                  <label className="mb-2 block text-sm font-medium text-foreground">
                    {t("providerSearch.maxRate")}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="number"
                      value={filters.maxRate ?? ""}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxRate:
                            e.target.value.trim() === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                      placeholder="No limit"
                      className="pl-9"
                    />
                  </div>
                  {filters.maxRate !== null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("providerSearch.upToRate", { rate: filters.maxRate })}
                    </p>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("providerSearch.availableNow")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("providerSearch.showOnlyOnline")}
                    </p>
                  </div>
                  <Switch
                    checked={filters.availableNow}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, availableNow: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t("providerSearch.verifiedOnly")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("providerSearch.backgroundChecked")}
                    </p>
                  </div>
                  <Switch
                    checked={filters.verifiedOnly}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, verifiedOnly: checked })
                    }
                  />
                </div>

                {activeFilterCount > 0 && (
                  <>
                    <Separator />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-foreground"
                      onClick={() =>
                        setFilters({
                          minRating: 0,
                          maxRate: null,
                          availableNow: false,
                          verifiedOnly: false,
                        })
                      }
                    >
                      {t("providerSearch.clearFilters")}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 relative z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {isPageLoading ? (
                    <Skeleton className="h-6 w-40 inline-block" />
                  ) : (
                    t("providerSearch.found", {
                      count: visibleProvidersCount,
                    })
                  )}
                </h2>
                {/* <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedCategory} · {location}
                </p> */}
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {(error as { message?: string }).message ??
                  t("providerSearch.failedLoad")}
              </div>
            )}

            {!isAuthLoading && Boolean(user) && !hasUserCountry && (
              <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                {t("providerSearch.countryRequiredNotice")}
              </div>
            )}

            {isPageLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i}>{renderSkeletonCard()}</div>
                ))}
              </div>
            ) : visibleProvidersCount === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold text-foreground">
                    {t("providerSearch.noProvidersTitle")}
                  </h3>
                  <p className="mb-5 text-sm text-muted-foreground max-w-xs mx-auto">
                    {t("providerSearch.noProvidersSubtitle")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory(ALL_SERVICES_LABEL);
                      setFilters({
                        minRating: 0,
                        maxRate: null,
                        availableNow: false,
                        verifiedOnly: false,
                      });
                    }}
                  >
                    {t("providerSearch.clearAllFilters")}
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
