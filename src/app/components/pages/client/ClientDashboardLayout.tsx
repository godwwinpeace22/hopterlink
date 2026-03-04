import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Badge } from "../../ui/badge";
import {
  Bell,
  Briefcase,
  Calendar,
  Gift,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Star,
  User,
  Wallet,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import {
  ClientDashboardProvider,
  ClientDashboardSection,
} from "./ClientDashboardContext";
import { ClientDashboardHeader } from "./ClientDashboardHeader";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
} from "../../ui/sidebar";

interface ClientDashboardLayoutProps {}

type BookingItem = {
  id: string;
  providerId: string | null;
  provider: string;
  providerRating: number;
  service: string;
  date: string;
  time: string;
  status: "upcoming" | "in-progress" | "completed";
  paymentStatus?: string | null;
  escrowStatus?: string | null;
  price: number;
  address: string;
  hasReview?: boolean;
};

type MessageItem = {
  id: string;
  provider: string;
  message: string;
  time: string;
  unread: boolean;
};

const emptyClientData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  avatar: "",
  memberSince: "",
};

const emptyBookings: BookingItem[] = [];
const emptyMessages: MessageItem[] = [];

export function ClientDashboardLayout({}: ClientDashboardLayoutProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardSections: ClientDashboardSection[] = [
    "overview",
    "providers",
    "booking",
    "bookings",
    "reviews",
    "wallet",
    "my-jobs",
    "job-details",
    "post-job",
    "messages",
    "notifications",
    "profile",
  ];

  const [activeSection, setActiveSection] =
    useState<ClientDashboardSection>("overview");
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null,
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewExists, setReviewExists] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [clientData, setClientData] = useState(emptyClientData);
  const [bookings, setBookings] = useState<BookingItem[]>(emptyBookings);
  const [messages, setMessages] = useState<MessageItem[]>(emptyMessages);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const getFirst = <T,>(value: T | T[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const normalizeSection = (value?: string | null) => {
    const candidate = value as ClientDashboardSection | null | undefined;
    return candidate && dashboardSections.includes(candidate)
      ? candidate
      : "overview";
  };

  useEffect(() => {
    const base = "/dashboard/client";
    if (!location.pathname.startsWith(base)) {
      setActiveSection("overview");
      return;
    }
    const remainder = location.pathname.slice(base.length).replace(/^\//, "");
    if (!remainder) {
      setActiveSection("overview");
      return;
    }
    const section = remainder.split("/")[0];
    if (section === "job") {
      setActiveSection("job-details");
      const jobId = remainder.split("/")[1] ?? null;
      setSelectedJobId(jobId);
      return;
    }
    setActiveSection(normalizeSection(section));
  }, [location.pathname]);

  const navigateToSection = (
    section: ClientDashboardSection,
    replace = false,
    jobIdValue?: string | null,
  ) => {
    let path = "/dashboard/client";

    if (section === "job-details") {
      path = jobIdValue
        ? `/dashboard/client/job/${jobIdValue}`
        : "/dashboard/client";
    } else if (section !== "overview") {
      path = `/dashboard/client/${section}`;
    }

    navigate(path, { replace });
  };

  const { data: profileResult } = useSupabaseQuery(
    ["profiles", user?.id],
    () =>
      supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url, location, created_at")
        .eq("id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  const { data: bookingsResult } = useSupabaseQuery(
    ["client_bookings", user?.id],
    () =>
      supabase
        .from("bookings")
        .select(
          `
            id,
            scheduled_date,
            status,
            payment_status,
            amount,
            location,
            service_type,
            escrow:escrow_payments (
              status
            ),
            provider:profiles!bookings_provider_id_fkey (
              id,
              full_name,
              avatar_url,
              provider_profiles (
                rating
              )
            )
          `,
        )
        .eq("client_id", user?.id ?? "")
        .order("scheduled_date", { ascending: true }),
    { enabled: Boolean(user?.id) },
  );

  const { data: messagesResult } = useSupabaseQuery(
    ["client_messages", user?.id],
    () =>
      supabase
        .from("messages")
        .select(
          `
            id,
            content,
            is_read,
            created_at,
            sender:profiles!messages_sender_id_fkey (
              full_name
            )
          `,
        )
        .eq("recipient_id", user?.id ?? "")
        .order("created_at", { ascending: false })
        .limit(5),
    { enabled: Boolean(user?.id) },
  );

  const { data: reviewsResult, refetch: refetchReviews } = useSupabaseQuery(
    ["client_reviews", user?.id],
    () =>
      supabase
        .from("reviews")
        .select("booking_id")
        .eq("reviewer_id", user?.id ?? ""),
    { enabled: Boolean(user?.id) },
  );

  const { data: notificationsResult } = useSupabaseQuery(
    ["client_notifications", user?.id],
    () =>
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user?.id ?? "")
        .eq("is_read", false),
    { enabled: Boolean(user?.id) },
  );

  useEffect(() => {
    if (profileResult?.error) {
      setErrorMessage(profileResult.error.message);
    } else if (profileResult?.data) {
      const memberSince = profileResult.data.created_at
        ? new Date(profileResult.data.created_at).getFullYear().toString()
        : "";
      const address =
        profileResult.data.location &&
        typeof profileResult.data.location === "object" &&
        !Array.isArray(profileResult.data.location)
          ? ((profileResult.data.location as { address?: string }).address ??
            "")
          : "";
      setClientData({
        name: profileResult.data.full_name ?? "",
        email: profileResult.data.email ?? "",
        phone: profileResult.data.phone ?? "",
        address,
        avatar: profileResult.data.avatar_url ?? "",
        memberSince,
      });
    }
  }, [profileResult]);

  useEffect(() => {
    if (notificationsResult?.error) {
      setErrorMessage(notificationsResult.error.message);
    } else if (typeof notificationsResult?.count === "number") {
      setUnreadNotifications(notificationsResult.count);
    }
  }, [notificationsResult]);

  useEffect(() => {
    if (bookingsResult?.error) {
      setErrorMessage(bookingsResult.error.message);
      return;
    }

    const reviewedBookingIds = new Set(
      (reviewsResult?.data ?? []).map((review) => review.booking_id),
    );

    const mappedBookings: BookingItem[] = (bookingsResult?.data ?? []).map(
      (booking) => {
        const scheduledDate = booking.scheduled_date
          ? new Date(booking.scheduled_date)
          : null;
        const status =
          booking.status === "completed"
            ? "completed"
            : booking.status === "in_progress"
              ? "in-progress"
              : "upcoming";
        const provider = getFirst(booking.provider);
        const providerProfiles = provider?.provider_profiles ?? [];
        const providerProfile = getFirst(providerProfiles);
        const escrow = getFirst(booking.escrow);
        const address =
          booking.location &&
          typeof booking.location === "object" &&
          !Array.isArray(booking.location)
            ? ((booking.location as { address?: string }).address ?? "")
            : "";
        return {
          id: booking.id,
          bookingStatus: booking.status ?? null,
          providerId: provider?.id ?? null,
          provider: provider?.full_name ?? "Service Provider",
          providerRating: providerProfile?.rating ?? 0,
          service: booking.service_type ?? "Service",
          date: scheduledDate ? scheduledDate.toLocaleDateString() : "",
          time: scheduledDate
            ? scheduledDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          status,
          paymentStatus: booking.payment_status ?? null,
          escrowStatus: escrow?.status ?? null,
          price: booking.amount ?? 0,
          address,
          hasReview: reviewedBookingIds.has(booking.id),
        };
      },
    );

    setBookings(mappedBookings);
  }, [bookingsResult, reviewsResult]);

  useEffect(() => {
    if (messagesResult?.error) {
      setErrorMessage(messagesResult.error.message);
      return;
    }

    const mappedMessages: MessageItem[] = (messagesResult?.data ?? []).map(
      (message) => {
        const createdAt = message.created_at
          ? new Date(message.created_at)
          : null;
        const sender = getFirst(message.sender);
        return {
          id: message.id,
          provider: sender?.full_name ?? "Provider",
          message: message.content ?? "",
          time: createdAt ? createdAt.toLocaleString() : "",
          unread: !message.is_read,
        };
      },
    );

    setMessages(mappedMessages);
    setUnreadMessages(mappedMessages.filter((m) => m.unread).length);
  }, [messagesResult]);

  useEffect(() => {
    if (reviewDialogOpen && selectedBooking) {
      setReviewExists(Boolean(selectedBooking.hasReview));
      setErrorMessage(null);
    }
  }, [reviewDialogOpen, selectedBooking]);

  const handleSubmitReview = async () => {
    if (!user?.id || !selectedBooking?.providerId) {
      setErrorMessage("Unable to submit review.");
      return;
    }

    if (reviewRating === 0) {
      setErrorMessage("Please select a rating.");
      return;
    }

    setIsReviewSubmitting(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: selectedBooking.id,
        reviewer_id: user.id,
        reviewee_id: selectedBooking.providerId,
        rating: reviewRating,
        comment: reviewComment.trim(),
        is_verified: true,
      });

      if (error) {
        throw error;
      }

      await refetchReviews();
      setReviewDialogOpen(false);
      setReviewRating(0);
      setReviewComment("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit review.";
      setErrorMessage(message);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const navigationItems = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "providers", label: "Browse Providers", icon: Briefcase },
      { id: "bookings", label: "Bookings", icon: Calendar },
      { id: "reviews", label: "Reviews", icon: Star },
      { id: "wallet", label: "Wallet", icon: Wallet },
      { id: "my-jobs", label: "My Jobs", icon: Briefcase },
      { id: "post-job", label: "Post a Job", icon: Gift },
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "profile", label: "Profile", icon: User },
    ],
    [],
  );

  const navigationSections = useMemo(
    () => [
      {
        title: "Overview",
        items: ["overview"] as ClientDashboardSection[],
      },
      {
        title: "Services",
        items: [
          "providers",
          "bookings",
          "reviews",
          "wallet",
        ] as ClientDashboardSection[],
      },
      {
        title: "Jobs",
        items: ["my-jobs", "post-job"] as ClientDashboardSection[],
      },
      {
        title: "Communication",
        items: ["messages", "notifications"] as ClientDashboardSection[],
      },
      {
        title: "Account",
        items: ["profile"] as ClientDashboardSection[],
      },
    ],
    [],
  );

  const sectionMeta = {
    overview: { title: "Overview", subtitle: "Your client dashboard" },
    providers: { title: "Browse Providers", subtitle: "Find local services" },
    booking: { title: "Booking", subtitle: "Complete your service booking" },
    bookings: { title: "Bookings", subtitle: "Manage your appointments" },
    reviews: { title: "Reviews", subtitle: "Track ratings and feedback" },
    wallet: { title: "Wallet", subtitle: "Manage wallet funding and history" },
    "my-jobs": { title: "My Jobs", subtitle: "Track posted jobs" },
    "job-details": { title: "Job Details", subtitle: "Review job details" },
    "post-job": { title: "Post a Job", subtitle: "Describe your request" },
    messages: { title: "Messages", subtitle: "Chat with providers" },
    notifications: {
      title: "Notifications",
      subtitle: "View updates and account alerts",
    },
    profile: { title: "Profile", subtitle: "Update your account" },
  } as const;

  const contextValue = {
    navigateToSection,
    bookings,
    messages,
    clientData,
    unreadMessages,
    selectedBooking,
    setSelectedBooking,
    reviewDialogOpen,
    setReviewDialogOpen,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewExists,
    isReviewSubmitting,
    handleSubmitReview,
    selectedJobId,
    setSelectedJobId,
  };

  return (
    <ClientDashboardProvider value={contextValue}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-3 py-4">
            <Link to="/dashboard/client" className="flex items-center gap-2">
              <img src={logo} alt="Hopterlink" className="h-7 w-auto" />
            </Link>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            {navigationSections.map((section) => (
              <SidebarGroup key={section.title} className="px-2">
                <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((itemId) => {
                      const item = navigationItems.find(
                        (navItem) => navItem.id === itemId,
                      );
                      if (!item) return null;
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() =>
                              navigateToSection(
                                item.id as ClientDashboardSection,
                              )
                            }
                            isActive={isActive}
                            tooltip={item.label}
                            className="cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            {item.id === "messages" && unreadMessages > 0 && (
                              <Badge className="ml-auto bg-red-500 text-white">
                                {unreadMessages}
                              </Badge>
                            )}
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter className="px-2 pb-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => navigate("/")}
                  className="text-red-600 hover:text-red-600 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="min-h-screen bg-gray-50">
          <ClientDashboardHeader
            clientName={clientData.name}
            avatarUrl={clientData.avatar}
            unreadNotifications={unreadNotifications}
          />

          <div className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {activeSection !== "providers" && activeSection !== "booking" && (
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {sectionMeta[activeSection].title}
                  </h1>
                  <p className="text-gray-600">
                    {sectionMeta[activeSection].subtitle}
                  </p>
                </div>
              )}

              {errorMessage && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ClientDashboardProvider>
  );
}
