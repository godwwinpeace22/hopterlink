import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useNavigate } from "@/lib/router";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/components/ui/avatar";
import { Card, CardContent } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import {
  Bell,
  Briefcase,
  Calendar,
  ChevronRight,
  HelpCircle,
  LogOut,
  MapPin,
  Phone,
  Settings,
  Star,
  User,
} from "lucide-react";

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "FH";
  return parts
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

const getLocationLabel = (location: unknown) => {
  if (location && typeof location === "object") {
    const address = (location as { address?: string }).address;
    const city = (location as { city?: string }).city;
    return address ?? city ?? "";
  }
  return "";
};

export const DashboardProfile = () => {
  const { user, activeRole, signOut } = useAuth();
  const role = activeRole;
  const navigate = useNavigate();

  const { data: profileResult } = useSupabaseQuery(
    ["dashboard_profile", user?.id],
    () =>
      supabase
        .from("profiles")
        .select(
          "id, full_name, email, phone, avatar_url, role, location, created_at",
        )
        .eq("id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  const { data: providerProfileResult } = useSupabaseQuery(
    ["dashboard_profile_provider", user?.id],
    () =>
      supabase
        .from("provider_profiles")
        .select("business_name, rating, total_reviews, jobs_completed, bio")
        .eq("user_id", user?.id ?? "")
        .maybeSingle(),
    { enabled: Boolean(user?.id) && role === "provider" },
  );

  const { data: reviewsResult } = useSupabaseQuery(
    ["dashboard_profile_reviews", user?.id],
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
        .eq("reviewee_id", user?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(5),
    { enabled: Boolean(user?.id) },
  );

  const { data: bookingsCountResult } = useSupabaseQuery(
    ["dashboard_profile_bookings_count", user?.id, role],
    () =>
      supabase
        .from("bookings")
        .select("id", { count: "exact", head: true })
        .eq(role === "provider" ? "provider_id" : "client_id", user?.id ?? "")
        .eq("status", "completed"),
    { enabled: Boolean(user?.id) && Boolean(role) },
  );

  const displayName =
    profileResult?.data?.full_name ??
    (user?.user_metadata?.full_name as string | undefined) ??
    "";
  const avatarUrl =
    profileResult?.data?.avatar_url ??
    (user?.user_metadata?.avatar_url as string | undefined) ??
    "";
  const memberSince = profileResult?.data?.created_at
    ? new Date(profileResult.data.created_at).getFullYear()
    : null;
  const location = getLocationLabel(profileResult?.data?.location);
  const phone = profileResult?.data?.phone ?? "";
  const email = profileResult?.data?.email ?? user?.email ?? "";
  const completedJobs = bookingsCountResult?.count ?? 0;

  const rating = useMemo(() => {
    const providerRating = providerProfileResult?.data?.rating;
    if (typeof providerRating === "number" && providerRating > 0) {
      return providerRating;
    }
    const list = reviewsResult?.data ?? [];
    if (list.length === 0) return 0;
    const total = list.reduce((sum, r) => sum + (r.rating ?? 0), 0);
    return Number((total / list.length).toFixed(1));
  }, [providerProfileResult, reviewsResult]);

  const menuItems = [
    {
      icon: Briefcase,
      label: role === "provider" ? "My Jobs" : "My Jobs",
      onClick: () =>
        navigate(
          role === "provider"
            ? "/dashboard/provider/jobs"
            : "/dashboard/client/my-jobs",
        ),
    },

    {
      icon: Star,
      label: "Reviews",
      onClick: () =>
        navigate(
          role === "provider"
            ? "/dashboard/provider/reviews"
            : "/dashboard/client/reviews",
        ),
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () =>
        navigate(
          role === "provider"
            ? "/dashboard/provider/settings"
            : "/dashboard/client/settings",
        ),
    },
    {
      icon: HelpCircle,
      label: "Help & Support",
      onClick: () => navigate("/help"),
    },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="space-y-5 pt-6 max-w-2xl">
      {/* Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-[#F7C876]/60 bg-white px-6 py-7 shadow-sm shadow-[#F7C876]/10">
        {/* Glow orbs */}
        <div className="pointer-events-none absolute -right-14 -top-20 h-56 w-56 rounded-full bg-[#F1A400]/[0.07]" />
        <div className="pointer-events-none absolute -bottom-12 -left-5 h-36 w-36 rounded-full bg-[#F1A400]/[0.04]" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex flex-col gap-2 min-w-0">
            {/* Role pill */}
            <span className="inline-flex w-fit items-center rounded-full border border-[#F1A400]/20 bg-[#F1A400]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#C17A00]">
              {role === "provider" ? "Provider Account" : "Client Account"}
            </span>

            <h2 className="text-2xl font-bold text-slate-950 leading-tight">
              {displayName || "User"}
            </h2>

            <p className="text-sm text-slate-500">{email}</p>

            <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate-500">
              {role === "client"
                ? "Manage your bookings, notifications and support preferences in one place."
                : "Manage your services, bookings, and client interactions."}
            </p>
          </div>

          <Avatar className="h-20 w-20 shrink-0 border-2 border-[#F7C876]/50">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="bg-[#F1A400] text-white text-xl font-bold">
              {getInitials(displayName || "User")}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info row */}
        <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#F7C876]/40 pt-4 text-sm text-slate-500">
          {memberSince && (
            <span className="flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#C17A00]" />
              Member since {memberSince}
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#C17A00]" />
              {location}
            </span>
          )}
          {phone && (
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#C17A00]" />
              {phone}
            </span>
          )}
          {rating > 0 && (
            <span className="flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating} rating
            </span>
          )}
          {completedJobs > 0 && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-[#C17A00]" />
              {completedJobs} completed
            </span>
          )}
        </div>
      </div>

      {/* Quick Nav Menu Card */}
      <Card className="overflow-hidden border-[#F3E4BE]">
        <CardContent className="p-0">
          {menuItems.map((item, index) => (
            <div key={item.label}>
              <button
                onClick={item.onClick}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[#FFF7E8] cursor-pointer"
              >
                <item.icon className="h-5 w-5 text-slate-500 shrink-0" />
                <span className="flex-1 text-sm font-medium text-slate-900">
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </button>
              {index < menuItems.length - 1 && (
                <Separator className="ml-[52px] bg-slate-100" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sign Out */}
      <Button
        variant="outline"
        className="w-full gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
        onClick={handleSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    </div>
  );
};
