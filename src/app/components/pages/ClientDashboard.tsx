import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Calendar,
  MessageSquare,
  Star,
  Bell,
  LogOut,
  Menu,
  Clock,
  MapPin,
  User,
  Plus,
  CheckCircle,
  Gift,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { MyJobs } from "./MyJobs";
import { JobDetails } from "./JobDetails";
import { PostJob } from "./PostJob";
import { Messages } from "./Messages";
interface ClientDashboardProps {
  section?: DashboardSection;
  jobId?: string | null;
}

type DashboardSection =
  | "overview"
  | "browse"
  | "bookings"
  | "my-jobs"
  | "job-details"
  | "post-job"
  | "messages"
  | "profile";

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

export function ClientDashboard({ section, jobId }: ClientDashboardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dashboardSections: DashboardSection[] = [
    "overview",
    "browse",
    "bookings",
    "my-jobs",
    "job-details",
    "post-job",
    "messages",
    "profile",
  ];

  const normalizeSection = (value?: string | null) => {
    const candidate = value as DashboardSection | null | undefined;
    return candidate && dashboardSections.includes(candidate)
      ? candidate
      : "overview";
  };

  const [activeSection, setActiveSection] = useState<DashboardSection>(() =>
    normalizeSection(section),
  );
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    jobId ?? null,
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const updateSectionUrl = (
    section: DashboardSection,
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

  const handleSectionChange = (section: DashboardSection) => {
    setActiveSection(section);
    updateSectionUrl(section);
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const nextSection = normalizeSection(section);
    if (nextSection !== activeSection) {
      setActiveSection(nextSection);
    }
  }, [section, activeSection]);

  useEffect(() => {
    if (jobId !== selectedJobId) {
      setSelectedJobId(jobId ?? null);
    }
  }, [jobId, selectedJobId]);

  const getFirst = <T,>(value: T | T[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const getAddressFromLocation = (location: unknown) => {
    if (location && typeof location === "object") {
      const address = (location as { address?: string }).address;
      return address ?? "";
    }
    return "";
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

  const { data: reviewsResult } = useSupabaseQuery(
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
      setClientData({
        name: profileResult.data.full_name ?? "",
        email: profileResult.data.email ?? "",
        phone: profileResult.data.phone ?? "",
        address: getAddressFromLocation(profileResult.data.location) || "",
        avatar: profileResult.data.avatar_url ?? "",
        memberSince,
      });
    }
  }, [profileResult]);

  useEffect(() => {
    if (reviewsResult?.error) {
      setErrorMessage(reviewsResult.error.message);
    }
  }, [reviewsResult]);

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
        return {
          id: booking.id,
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
          address: getAddressFromLocation(booking.location),
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
  }, [messagesResult]);

  useEffect(() => {
    if (reviewDialogOpen && selectedBooking) {
      setReviewExists(Boolean(selectedBooking.hasReview));
      setErrorMessage(null);
    }
  }, [reviewDialogOpen, selectedBooking]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel(`client-messages-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const newMessage = payload.new as {
            id: string;
            content: string;
            is_read: boolean;
            created_at: string;
            sender_id: string;
          };

          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === newMessage.id);
            if (exists) return prev;
            return [
              {
                id: newMessage.id,
                provider: "Provider",
                message: newMessage.content ?? "",
                time: newMessage.created_at
                  ? new Date(newMessage.created_at).toLocaleString()
                  : "",
                unread: !newMessage.is_read,
              },
              ...prev,
            ];
          });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; is_read: boolean };
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updated.id
                ? { ...msg, unread: !updated.is_read }
                : msg,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const channel = supabase
      .channel(`client-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          setUnreadNotifications((prev) => prev + 1);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as { is_read: boolean };
          if (updated.is_read) {
            setUnreadNotifications((prev) => Math.max(prev - 1, 0));
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const activeBookings = useMemo(
    () => bookings.filter((b) => b.status !== "completed").length,
    [bookings],
  );

  const navigationItems = [
    {
      id: "overview" as DashboardSection,
      label: "Overview",
      icon: LayoutDashboard,
    },
    { id: "browse" as DashboardSection, label: "Find Providers", icon: Search },
    {
      id: "post-job" as DashboardSection,
      label: "Post Job",
      icon: Plus,
    },
    {
      id: "my-jobs" as DashboardSection,
      label: "My Jobs",
      icon: Briefcase,
    },
    {
      id: "bookings" as DashboardSection,
      label: "My Bookings",
      icon: Briefcase,
      badge: activeBookings,
    },
    {
      id: "messages" as DashboardSection,
      label: "Messages",
      icon: MessageSquare,
    },
    { id: "profile" as DashboardSection, label: "Profile", icon: User },
  ];

  const sectionMeta: Record<
    DashboardSection,
    { title: string; subtitle: string }
  > = {
    overview: {
      title: "Welcome back",
      subtitle: `Welcome back, ${(clientData.name || "Client").split(" ")[0]}! 👋`,
    },
    browse: {
      title: "Find Providers",
      subtitle: "Discover top-rated service providers near you",
    },
    bookings: {
      title: "My Bookings",
      subtitle: "Track upcoming and past appointments",
    },
    "my-jobs": {
      title: "My Jobs",
      subtitle: "Manage your job posts and quotes",
    },
    "job-details": {
      title: "Job Details",
      subtitle: "Review and update your job",
    },
    "post-job": {
      title: "Post a Job",
      subtitle: "Share the details and get quotes fast",
    },
    messages: {
      title: "Messages",
      subtitle: "Stay in touch with providers",
    },
    profile: {
      title: "Profile",
      subtitle: "Update your personal details and preferences",
    },
  };

  const unreadMessages = useMemo(
    () => messages.filter((m) => m.unread).length,
    [messages],
  );

  const handleSubmitReview = async () => {
    if (!user?.id || !selectedBooking?.id || !selectedBooking.providerId) {
      setErrorMessage("Unable to submit review. Please try again.");
      return;
    }

    if (reviewRating === 0) {
      setErrorMessage("Please select a rating before submitting.");
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
        comment: reviewComment,
        is_verified: true,
      });

      if (error) {
        throw error;
      }

      await supabase.from("notifications").insert({
        user_id: selectedBooking.providerId,
        type: "review_received",
        title: "New Review Received",
        message: `You received a ${reviewRating}-star review for ${selectedBooking.service}.`,
        related_id: selectedBooking.id,
      });

      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === selectedBooking.id
            ? { ...booking, hasReview: true }
            : booking,
        ),
      );
      alert("Review submitted successfully!");
      setReviewDialogOpen(false);
      setReviewRating(0);
      setReviewComment("");
      setSelectedBooking(null);
      setReviewExists(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit review.";
      setErrorMessage(message);
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-600">
            Active Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter((b) => b.status !== "completed").length}
              </p>
              <p className="text-xs text-gray-600 mt-1">In progress</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-600">
            Completed Jobs
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {bookings.filter((b) => b.status === "completed").length}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total completed</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-600">
            Unread Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {unreadMessages}
              </p>
              <p className="text-xs text-gray-600 mt-1">New messages</p>
            </div>
            <MessageSquare className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader className="pb-1">
          <CardTitle className="text-xs font-medium text-gray-600">
            Member Since
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-semibold text-gray-900">
                {clientData.memberSince}
              </p>
              <p className="text-xs text-gray-600 mt-1">Trusted member</p>
            </div>
            <User className="h-8 w-8 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {renderStatsCards()}

      {/* Quick Actions - Post a Job */}
      <Card className="border-2 border-[#F7C876] bg-gradient-to-r from-[#FDEFD6] to-white">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Need a service?
              </h3>
              <p className="text-gray-600 mb-4">
                Post a job and receive competitive quotes from qualified
                providers in your area
              </p>
              <div className="flex gap-3">
                <Button
                  className="bg-[#F7C876] hover:bg-[#EFA055]"
                  onClick={() => updateSectionUrl("post-job")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post a New Job
                </Button>
                <Button
                  variant="outline"
                  onClick={() => updateSectionUrl("my-jobs")}
                >
                  View My Jobs
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="h-24 w-24 bg-[#F7C876] rounded-full flex items-center justify-center">
                <Briefcase className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Upcoming Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bookings
                .filter((b) => b.status === "upcoming")
                .map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {booking.service}
                      </p>
                      <p className="text-sm text-gray-600">
                        {booking.provider}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 ${star <= Math.floor(booking.providerRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {booking.date} at {booking.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        ${booking.price}
                      </p>
                      <Badge
                        variant="outline"
                        className="mt-1 text-blue-600 border-blue-600"
                      >
                        Scheduled
                      </Badge>
                    </div>
                  </div>
                ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSectionChange("bookings")}
              >
                View All Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-blue-600" />
              Recent Messages
              {unreadMessages > 0 && (
                <Badge className="bg-red-500 text-white">
                  {unreadMessages}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 pb-4 border-b last:border-0 ${message.unread ? "bg-blue-50 -mx-6 px-6 py-3" : ""}`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {message.provider
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">
                        {message.provider}
                      </p>
                      {message.unread && (
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {message.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{message.time}</p>
                  </div>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSectionChange("messages")}
              >
                View All Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Banner */}
      <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  Earn Rewards & Cashback!
                </h3>
                <p className="text-purple-100">
                  Get points on every booking, refer friends, and unlock
                  exclusive perks
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/rewards")}
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
              size="lg"
            >
              View Rewards
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBrowseProviders = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Service Providers</CardTitle>
          <CardDescription>Search for local professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Input placeholder="Service (e.g., plumbing, cleaning)" />
            <Input placeholder="Location" defaultValue="Springfield" />
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/dashboard/client/providers")}
            >
              <Search className="h-4 w-4 mr-2" />
              Search Providers
            </Button>
          </div>

          <div className="text-center py-8 bg-blue-50 rounded-lg">
            <Search className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">
              Ready to find the perfect service provider?
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/dashboard/client/providers")}
            >
              Browse All Providers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Manage your service appointments</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const upcomingBookings = bookings.filter(
              (b) => b.status === "upcoming",
            );
            const inProgressBookings = bookings.filter(
              (b) => b.status === "in-progress",
            );
            const completedBookings = bookings.filter(
              (b) => b.status === "completed",
            );

            const renderEmpty = (title: string, message: string) => (
              <Card>
                <CardContent className="py-10 text-center text-gray-600">
                  <Calendar className="h-10 w-10 mx-auto mb-3 text-gray-300" />
                  <p className="font-semibold text-gray-900 mb-1">{title}</p>
                  <p className="text-sm text-gray-500">{message}</p>
                </CardContent>
              </Card>
            );

            return (
              <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upcoming">
                    Upcoming ({upcomingBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="in-progress">
                    In Progress ({inProgressBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedBookings.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4 mt-6">
                  {upcomingBookings.length === 0
                    ? renderEmpty(
                        "No upcoming bookings",
                        "Book a service to see it here.",
                      )
                    : upcomingBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                                    {booking.provider
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">
                                      {booking.service}
                                    </h3>
                                    <Badge className="bg-blue-600">
                                      Upcoming
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {booking.provider}
                                  </p>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= Math.floor(booking.providerRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                                      />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">
                                      ({booking.providerRating})
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      {booking.date} at {booking.time}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {booking.address}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Payment:{" "}
                                      {booking.escrowStatus ??
                                        booking.paymentStatus ??
                                        "pending"}
                                    </p>
                                    <p className="font-bold text-gray-900 mt-2">
                                      Price: ${booking.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    booking.providerId
                                      ? navigate("/messages", {
                                          state: {
                                            recipientId: booking.providerId,
                                            bookingId: booking.id,
                                            recipientName: booking.provider,
                                            contextLabel: `Booking: ${booking.service}`,
                                          },
                                        })
                                      : undefined
                                  }
                                  disabled={!booking.providerId}
                                >
                                  Contact Provider
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 border-red-600 hover:bg-red-50"
                                >
                                  Cancel Booking
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-4 mt-6">
                  {inProgressBookings.length === 0
                    ? renderEmpty(
                        "No active bookings",
                        "You have no bookings in progress right now.",
                      )
                    : inProgressBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="bg-blue-600 text-white text-lg">
                                    {booking.provider
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">
                                      {booking.service}
                                    </h3>
                                    <Badge className="bg-orange-500">
                                      In Progress
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {booking.provider}
                                  </p>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= Math.floor(booking.providerRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                                      />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">
                                      ({booking.providerRating})
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Started: {booking.date} at {booking.time}
                                    </p>
                                    <p className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4" />
                                      {booking.address}
                                    </p>
                                    <p className="font-bold text-gray-900 mt-2">
                                      Price: ${booking.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    booking.providerId
                                      ? navigate("/messages", {
                                          state: {
                                            recipientId: booking.providerId,
                                            bookingId: booking.id,
                                            recipientName: booking.provider,
                                            contextLabel: `Booking: ${booking.service}`,
                                          },
                                        })
                                      : undefined
                                  }
                                  disabled={!booking.providerId}
                                >
                                  Contact Provider
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4 mt-6">
                  {completedBookings.length === 0
                    ? renderEmpty(
                        "No completed bookings",
                        "Finished services will appear here.",
                      )
                    : completedBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="bg-green-600 text-white text-lg">
                                    {booking.provider
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">
                                      {booking.service}
                                    </h3>
                                    <Badge className="bg-green-600">
                                      Completed
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {booking.provider}
                                  </p>
                                  <div className="flex items-center gap-1 mb-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        className={`h-4 w-4 ${star <= Math.floor(booking.providerRating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                                      />
                                    ))}
                                    <span className="text-sm text-gray-600 ml-1">
                                      ({booking.providerRating})
                                    </span>
                                  </div>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4" />
                                      Completed: {booking.date}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      Payment:{" "}
                                      {booking.escrowStatus ??
                                        booking.paymentStatus ??
                                        "pending"}
                                    </p>
                                    <p className="font-bold text-green-600 mt-2">
                                      Paid: ${booking.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setReviewDialogOpen(true);
                                  }}
                                  disabled={Boolean(booking.hasReview)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  {booking.hasReview
                                    ? "Reviewed"
                                    : "Leave Review"}
                                </Button>
                                <Button size="sm" variant="outline">
                                  View Receipt
                                </Button>
                                <Button size="sm" variant="outline">
                                  Book Again
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                </TabsContent>
              </Tabs>
            );
          })()}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {selectedBooking?.provider}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {reviewExists && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  You have already submitted a review for this booking.
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedBooking.service}</p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.provider}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${star <= reviewRating ? "fill-red-500 text-red-500" : "text-gray-300"} hover:text-red-400 transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Review
                </label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-[120px]"
                  placeholder="Share details about your experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={
                    reviewRating === 0 || reviewExists || isReviewSubmitting
                  }
                >
                  {isReviewSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
                <Button
                  onClick={() => {
                    setReviewDialogOpen(false);
                    setReviewRating(0);
                    setReviewComment("");
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );

  const renderMessages = () => <Messages embedded />;

  const renderProfile = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={clientData.avatar} />
              <AvatarFallback className="text-2xl bg-blue-600 text-white">
                {clientData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="mr-2">
                Change Photo
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input defaultValue={clientData.name} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input type="email" defaultValue={clientData.email} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Phone Number
              </label>
              <Input defaultValue={clientData.phone} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <Input defaultValue={clientData.address} />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Booking Confirmations</p>
              <p className="text-sm text-gray-600">
                Get notified when bookings are confirmed
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Service Reminders</p>
              <p className="text-sm text-gray-600">
                Reminders 24 hours before appointments
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Messages</p>
              <p className="text-sm text-gray-600">
                Notifications for new messages
              </p>
            </div>
            <input type="checkbox" defaultChecked className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <img src={logo} alt="Hopterlink" className="h-8 w-auto" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => navigate("/notifications")}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </Button>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={clientData.avatar} />
                <AvatarFallback className="bg-blue-600 text-white">
                  {clientData.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="font-semibold text-gray-900">{clientData.name}</p>
                <p className="text-sm text-gray-600">Client Account</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r z-40
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
        >
          <nav className="p-4 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.id === "messages" && unreadMessages > 0 && (
                    <Badge
                      className={`ml-auto ${isActive ? "bg-red-600" : "bg-red-500"} text-white`}
                    >
                      {unreadMessages}
                    </Badge>
                  )}
                  {item.badge && (
                    <Badge
                      className={`ml-auto ${isActive ? "bg-blue-600" : "bg-blue-500"} text-white`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t">
              <button
                onClick={() => navigate("/")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </nav>
        </aside>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {sectionMeta[activeSection].title}
              </h1>
              <p className="text-gray-600">
                {sectionMeta[activeSection].subtitle}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}
            {/* {isLoading && (
              <div className="mb-4 text-sm text-gray-600">
                Loading dashboard...
              </div>
            )} */}

            {/* Render Active Section */}
            {activeSection === "overview" && renderOverview()}
            {activeSection === "browse" && renderBrowseProviders()}
            {activeSection === "bookings" && renderBookings()}
            {activeSection === "my-jobs" && <MyJobs embedded />}
            {activeSection === "job-details" && (
              <JobDetails embedded jobId={selectedJobId} />
            )}
            {activeSection === "post-job" && <PostJob embedded />}
            {activeSection === "messages" && renderMessages()}
            {activeSection === "profile" && renderProfile()}
          </div>
        </main>
      </div>
    </div>
  );
}
