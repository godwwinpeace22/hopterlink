import { useEffect, useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { Badge } from "../ui/badge";
import {
  Bell,
  Calendar as CalendarIcon,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Star,
  User,
  Search,
  Wallet,
} from "lucide-react";
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
} from "../ui/sidebar";
import { ProviderDashboardHeader } from "./provider/ProviderDashboardHeader";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import {
  ProviderDashboardProvider,
  ProviderDashboardSection,
} from "./provider/ProviderDashboardContext";

type JobRequest = {
  id: string;
  jobId: string;
  clientId: string;
  client: string;
  service: string;
  description: string;
  date: string;
  timePreference: string;
  budget: string;
  address: string;
  urgency: "urgent" | "flexible";
  clientRating: number;
  postedTime: string;
};

type AcceptedJob = {
  id: string;
  jobId?: string | null;
  clientId: string;
  client: string;
  service: string;
  date: string;
  time: string;
  status: "upcoming" | "in-progress" | "completed";
  price: number;
  address: string;
  description: string;
};

type ProviderReview = {
  id: string;
  reviewerId: string;
  client: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  response?: string | null;
  responseAt?: string | null;
  verified?: boolean;
};

type ProviderTransaction = {
  id: string;
  date: string;
  client: string;
  service: string;
  amount: number;
  status: string;
};

type ProviderQuote = {
  id: string;
  jobId: string;
  jobTitle: string;
  category: string;
  clientId: string;
  clientName: string;
  status: string;
  bookingId?: string | null;
  bookingStatus?: string | null;
  amount: number;
  timeline: string;
  message: string;
  createdAt: string;
  budget: string;
  location: string;
};

type VerificationStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

const emptyProviderData = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  rating: 0,
  totalReviews: 0,
  completedJobs: 0,
  activeJobs: 0,
  pendingRequests: 0,
  earnings: {
    thisMonth: 0,
    lastMonth: 0,
    total: 0,
    pending: 0,
  },
  services: [] as string[],
  avatar: "",
  bio: "",
  verification: {
    emailVerified: false,
    idUploaded: false,
    insuranceUploaded: false,
    certificationsUploaded: false,
    profileComplete: false,
    paymentSetup: false,
    backgroundCheckComplete: false,
    isFullyVerified: false,
  },
};

const emptyJobRequests: JobRequest[] = [];
const emptyAcceptedJobs: AcceptedJob[] = [];
const emptyReviews: ProviderReview[] = [];
const emptyTransactions: ProviderTransaction[] = [];

export function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const dashboardSections: ProviderDashboardSection[] = [
    "overview",
    "job-board",
    "jobs",
    "calendar",
    "wallet",
    "profile",
    "messages",
    "notifications",
    "reviews",
    "settings",
  ];

  const restrictedSections: ProviderDashboardSection[] = [
    "job-board",
    "jobs",
    "calendar",
    "wallet",
    "reviews",
  ];

  const [providerData, setProviderData] = useState(emptyProviderData);
  const [jobRequests, setJobRequests] =
    useState<JobRequest[]>(emptyJobRequests);
  const [acceptedJobs, setAcceptedJobs] =
    useState<AcceptedJob[]>(emptyAcceptedJobs);
  const [reviews, setReviews] = useState<ProviderReview[]>(emptyReviews);
  const [transactions, setTransactions] =
    useState<ProviderTransaction[]>(emptyTransactions);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<
    VerificationStatus | "loading"
  >("loading");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );

  const [selectedJobRequest, setSelectedJobRequest] =
    useState<JobRequest | null>(null);
  const [quoteDialogOpen, setQuoteDialogOpen] = useState(false);
  const [quoteAmount, setQuoteAmount] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");

  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ProviderReview | null>(
    null,
  );
  const [responseText, setResponseText] = useState("");

  const isVerificationReady = verificationStatus !== "loading";
  const isPendingReview = verificationStatus === "pending";
  const needsOnboarding =
    verificationStatus === "not_started" ||
    verificationStatus === "rejected" ||
    verificationStatus === "expired";

  const getFirst = <T,>(value: T | T[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const getLocationLabel = (location: unknown) => {
    if (location && typeof location === "object") {
      const address = (location as { address?: string }).address;
      const city = (location as { city?: string }).city;
      return address ?? city ?? "";
    }
    return "";
  };

  const normalizeSection = (value?: string | null) => {
    const candidate = value as ProviderDashboardSection | null | undefined;
    return candidate && dashboardSections.includes(candidate)
      ? candidate
      : "overview";
  };

  const activeSection = (() => {
    const base = "/dashboard/provider";
    if (!location.pathname.startsWith(base)) {
      return "overview";
    }
    const remainder = location.pathname.slice(base.length).replace(/^\//, "");
    if (!remainder) {
      return "overview";
    }
    const section = remainder.split("/")[0];
    return normalizeSection(section);
  })();

  const navigateToSection = (
    section: ProviderDashboardSection,
    replace = false,
  ) => {
    const path =
      section === "overview"
        ? "/dashboard/provider"
        : `/dashboard/provider/${section}`;
    navigate(path, { replace });
  };

  const handleSectionChange = (section: ProviderDashboardSection) => {
    if (
      (needsOnboarding || isPendingReview) &&
      restrictedSections.includes(section)
    ) {
      setErrorMessage(
        needsOnboarding
          ? "Complete onboarding to access jobs, earnings, and reviews."
          : "Your verification is under review. Some sections are locked.",
      );
      if (needsOnboarding) {
        navigate("/provider/onboarding");
      }
      return;
    }
    navigateToSection(section);
  };

  const { data: profileResult } = useSupabaseQuery(
    ["profiles", user?.id],
    () =>
      supabase
        .from("profiles")
        .select("full_name, email, phone, avatar_url")
        .eq("id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  const { data: providerProfileResult } = useSupabaseQuery(
    ["provider_profiles", user?.id],
    () =>
      supabase
        .from("provider_profiles")
        .select(
          "business_name, rating, total_reviews, jobs_completed, services, bio, verification_status, total_earned",
        )
        .eq("user_id", user?.id ?? "")
        .maybeSingle(),
    { enabled: Boolean(user?.id) },
  );

  const { data: bookingsResult, refetch: refetchBookings } = useSupabaseQuery(
    ["provider_bookings", user?.id],
    () =>
      supabase
        .from("bookings")
        .select(
          `
          id,
          job_id,
          scheduled_date,
          status,
          amount,
          location,
          description,
          service_type,
          client:profiles!bookings_client_id_fkey (
            id,
            full_name
          )
        `,
        )
        .eq("provider_id", user?.id ?? "")
        .order("scheduled_date", { ascending: true }),
    { enabled: Boolean(user?.id) },
  );

  const { data: quotesResult, refetch: refetchQuotes } = useSupabaseQuery(
    ["provider_quotes", user?.id],
    () =>
      supabase
        .from("quotes")
        .select(
          `
          id,
          amount,
          estimated_duration,
          message,
          status,
          created_at,
          booking:bookings!bookings_quote_id_fkey (
            id,
            status
          ),
          job:jobs (
            id,
            title,
            category,
            location,
            budget_min,
            budget_max,
            created_at,
            client:profiles!jobs_client_id_fkey (
              id,
              full_name
            )
          )
        `,
        )
        .eq("provider_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  const { data: messagesResult } = useSupabaseQuery(
    ["provider_messages", user?.id],
    () =>
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user?.id ?? "")
        .eq("is_read", false),
    { enabled: Boolean(user?.id) },
  );

  const { data: earningsResult } = useSupabaseQuery(
    ["provider_earnings_summary", user?.id],
    () =>
      supabase
        .from("escrow_payments")
        .select("provider_amount, amount, status, created_at")
        .eq("provider_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  const { data: reviewsResult } = useSupabaseQuery(
    ["provider_reviews", user?.id],
    () =>
      supabase
        .from("reviews")
        .select(
          `
          id,
          reviewer_id,
          rating,
          comment,
          response,
          response_at,
          is_verified,
          created_at,
          booking:bookings (
            service_type
          ),
          reviewer:profiles!reviews_reviewer_id_fkey (
            full_name
          )
        `,
        )
        .eq("reviewee_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  const { data: notificationsResult } = useSupabaseQuery(
    ["provider_notifications", user?.id],
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
      setProviderData((prev) => ({
        ...prev,
        name: profileResult.data.full_name ?? "",
        email: profileResult.data.email ?? "",
        phone: profileResult.data.phone ?? "",
        avatar: profileResult.data.avatar_url ?? "",
      }));
    }
  }, [profileResult]);

  useEffect(() => {
    if (providerProfileResult?.error) {
      setErrorMessage(providerProfileResult.error.message);
    } else if (providerProfileResult?.data) {
      setProviderData((prev) => ({
        ...prev,
        businessName: providerProfileResult.data.business_name ?? "",
        rating: providerProfileResult.data.rating ?? 0,
        totalReviews: providerProfileResult.data.total_reviews ?? 0,
        completedJobs: providerProfileResult.data.jobs_completed ?? 0,
        services: providerProfileResult.data.services ?? [],
        bio: providerProfileResult.data.bio ?? "",
        earnings: {
          ...prev.earnings,
          total: providerProfileResult.data.total_earned ?? 0,
        },
      }));
      setVerificationStatus(
        (providerProfileResult.data.verification_status ??
          "not_started") as VerificationStatus,
      );
    }
  }, [providerProfileResult]);

  useEffect(() => {
    if (bookingsResult?.error) {
      setErrorMessage(bookingsResult.error.message);
      return;
    }

    const bookings = bookingsResult?.data ?? [];
    const mappedJobs: AcceptedJob[] = bookings
      .filter((booking) => booking.status !== "pending")
      .map((booking) => {
        const scheduledDate = booking.scheduled_date
          ? new Date(booking.scheduled_date)
          : null;
        const status =
          booking.status === "completed"
            ? "completed"
            : booking.status === "in_progress"
              ? "in-progress"
              : "upcoming";
        const client = getFirst(booking.client);
        const address =
          booking.location &&
          typeof booking.location === "object" &&
          !Array.isArray(booking.location)
            ? ((booking.location as { address?: string }).address ?? "")
            : "";
        return {
          id: booking.id,
          jobId: booking.job_id ?? null,
          clientId: client?.id ?? "",
          client: client?.full_name ?? "Client",
          service: booking.service_type ?? "Service",
          date: scheduledDate ? scheduledDate.toLocaleDateString() : "",
          time: scheduledDate
            ? scheduledDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          status,
          price: booking.amount ?? 0,
          address,
          description: booking.description ?? "",
        };
      });

    const mappedRequests: JobRequest[] = bookings
      .filter((booking) => booking.status === "pending")
      .map((booking) => {
        const scheduledDate = booking.scheduled_date
          ? new Date(booking.scheduled_date)
          : null;
        const client = getFirst(booking.client);
        return {
          id: booking.id,
          jobId: booking.job_id ?? "",
          clientId: client?.id ?? "",
          client: client?.full_name ?? "Client",
          service: booking.service_type ?? "Service",
          description: booking.description ?? "",
          date: scheduledDate ? scheduledDate.toLocaleDateString() : "",
          timePreference: scheduledDate
            ? scheduledDate.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "",
          budget: `${booking.amount ?? 0}`,
          address: getLocationLabel(booking.location),
          urgency: "flexible",
          clientRating: 0,
          postedTime: scheduledDate ? scheduledDate.toLocaleDateString() : "",
        };
      });

    setAcceptedJobs(mappedJobs);
    setJobRequests(mappedRequests);
    setProviderData((prev) => ({
      ...prev,
      pendingRequests: mappedRequests.length,
      activeJobs: mappedJobs.filter((job) => job.status === "in-progress")
        .length,
    }));
  }, [bookingsResult]);

  useEffect(() => {
    if (!earningsResult?.data) return;

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const mapped = earningsResult.data.map((payment) => {
      const amount = Number(payment.provider_amount ?? payment.amount ?? 0);
      const createdAt = payment.created_at
        ? new Date(payment.created_at)
        : null;
      return {
        amount,
        status: payment.status ?? "pending",
        createdAt,
      };
    });

    const totalReleased = mapped
      .filter((entry) => entry.status === "released")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const pendingTotal = mapped
      .filter((entry) => entry.status === "pending" || entry.status === "held")
      .reduce((sum, entry) => sum + entry.amount, 0);
    const monthReleased = mapped
      .filter(
        (entry) =>
          entry.status === "released" &&
          entry.createdAt &&
          entry.createdAt.getTime() >= monthStart.getTime(),
      )
      .reduce((sum, entry) => sum + entry.amount, 0);

    setProviderData((prev) => ({
      ...prev,
      earnings: {
        ...prev.earnings,
        total: totalReleased || prev.earnings.total,
        thisMonth: monthReleased,
        pending: pendingTotal,
      },
    }));
  }, [earningsResult]);

  const providerQuotes = useMemo(() => {
    if (quotesResult?.error) {
      setErrorMessage(quotesResult.error.message);
      return [] as ProviderQuote[];
    }

    return (quotesResult?.data ?? []).map((quote) => {
      const job = getFirst(quote.job);
      const booking = getFirst(quote.booking);
      const client = getFirst(job?.client);
      const budgetMin = job?.budget_min ?? null;
      const budgetMax = job?.budget_max ?? null;
      const budget =
        budgetMin && budgetMax
          ? `${budgetMin}-${budgetMax}`
          : budgetMin
            ? `${budgetMin}`
            : budgetMax
              ? `${budgetMax}`
              : "";

      return {
        id: quote.id,
        jobId: job?.id ?? "",
        jobTitle: job?.title ?? "Job",
        category: job?.category ?? "",
        clientId: client?.id ?? "",
        clientName: client?.full_name ?? "Client",
        status: quote.status ?? "pending",
        bookingId: booking?.id ?? null,
        bookingStatus: booking?.status ?? null,
        amount: quote.amount ?? 0,
        timeline: quote.estimated_duration ?? "Flexible",
        message: quote.message ?? "",
        createdAt: quote.created_at
          ? new Date(quote.created_at).toLocaleDateString()
          : "",
        budget,
        location: getLocationLabel(job?.location),
      };
    });
  }, [quotesResult]);

  useEffect(() => {
    if (reviewsResult?.error) {
      setErrorMessage(reviewsResult.error.message);
      return;
    }

    const mappedReviews: ProviderReview[] = (reviewsResult?.data ?? []).map(
      (review) => {
        const reviewer = getFirst(review.reviewer);
        const booking = getFirst(review.booking);
        return {
          id: review.id,
          reviewerId: review.reviewer_id,
          client: reviewer?.full_name ?? "Client",
          rating: review.rating ?? 0,
          date: review.created_at
            ? new Date(review.created_at).toLocaleDateString()
            : "",
          service: booking?.service_type ?? "Service",
          comment: review.comment ?? "",
          response: review.response ?? null,
          responseAt: review.response_at ?? null,
          verified: review.is_verified ?? false,
        };
      },
    );

    setReviews(mappedReviews);
  }, [reviewsResult]);

  useEffect(() => {
    if (notificationsResult?.error) {
      setErrorMessage(notificationsResult.error.message);
    } else if (typeof notificationsResult?.count === "number") {
      setUnreadNotifications(notificationsResult.count);
    }
  }, [notificationsResult]);

  useEffect(() => {
    if (messagesResult?.error) {
      setErrorMessage(messagesResult.error.message);
    } else if (typeof messagesResult?.count === "number") {
      setUnreadMessages(messagesResult.count);
    }
  }, [messagesResult]);

  useEffect(() => {
    const mappedTransactions: ProviderTransaction[] = acceptedJobs.map(
      (job) => ({
        id: job.id,
        date: job.date,
        client: job.client,
        service: job.service,
        amount: job.price,
        status: job.status === "completed" ? "paid" : "pending",
      }),
    );
    setTransactions(mappedTransactions);
  }, [acceptedJobs]);

  const handleAcceptRequest = async (requestId: string) => {
    setJobRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const handleDeclineRequest = async (requestId: string) => {
    setJobRequests((prev) => prev.filter((req) => req.id !== requestId));
  };

  const handleSubmitQuote = async () => {
    setQuoteDialogOpen(false);
    setQuoteAmount("");
    setQuoteNotes("");
  };

  const handleStartJob = async (job: AcceptedJob) => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to update a job.");
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("provider_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (job.jobId) {
      const { error: jobStatusError } = await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", job.jobId);

      if (jobStatusError) {
        setErrorMessage(jobStatusError.message);
        return;
      }
    }

    await Promise.all([refetchBookings(), refetchQuotes()]);

    setAcceptedJobs((prev) =>
      prev.map((item) =>
        item.id === job.id ? { ...item, status: "in-progress" } : item,
      ),
    );
  };

  const handleCompleteJob = async (job: AcceptedJob) => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to update a job.");
      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("provider_id", user.id);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    const { error: paymentError } = await supabase
      .from("escrow_payments")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("booking_id", job.id)
      .eq("provider_id", user.id);

    if (paymentError) {
      setErrorMessage(paymentError.message);
      return;
    }

    await supabase
      .from("bookings")
      .update({ payment_status: "released" })
      .eq("id", job.id)
      .eq("provider_id", user.id);

    if (job.jobId) {
      const { error: jobStatusError } = await supabase
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", job.jobId);

      if (jobStatusError) {
        setErrorMessage(jobStatusError.message);
        return;
      }
    }

    await Promise.all([refetchBookings(), refetchQuotes()]);

    setAcceptedJobs((prev) =>
      prev.map((item) =>
        item.id === job.id ? { ...item, status: "completed" } : item,
      ),
    );
  };

  const handleSubmitResponse = async () => {
    if (!selectedReview) return;
    setReviews((prev) =>
      prev.map((review) =>
        review.id === selectedReview.id
          ? {
              ...review,
              response: responseText,
              responseAt: new Date().toISOString(),
            }
          : review,
      ),
    );
    setResponseDialogOpen(false);
    setResponseText("");
    setSelectedReview(null);
  };

  type NavItem = {
    id: ProviderDashboardSection;
    label: string;
    icon: typeof LayoutDashboard;
    badge?: string;
  };

  const navigationItems: NavItem[] = useMemo(
    () => [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "job-board", label: "Job Board", icon: Search },
      { id: "jobs", label: "My Jobs", icon: CalendarIcon },
      { id: "calendar", label: "Calendar", icon: CalendarIcon },
      { id: "wallet", label: "Wallet", icon: Wallet },
      { id: "profile", label: "Profile", icon: User },
      { id: "messages", label: "Messages", icon: MessageSquare },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "reviews", label: "Reviews", icon: Star },
      { id: "settings", label: "Settings", icon: Settings },
    ],
    [],
  );

  const navigationSections = [
    {
      title: "Overview",
      items: ["overview"],
    },
    {
      title: "Work",
      items: ["job-board", "jobs", "calendar", "messages", "notifications"],
    },
    {
      title: "Business",
      items: ["wallet", "reviews"],
    },
    {
      title: "Account",
      items: ["profile", "settings"],
    },
  ];

  const contextValue = {
    providerData,
    jobRequests,
    acceptedJobs,
    providerQuotes,
    transactions,
    reviews,
    quoteDialogOpen,
    setQuoteDialogOpen,
    selectedJobRequest,
    setSelectedJobRequest,
    quoteAmount,
    setQuoteAmount,
    quoteNotes,
    setQuoteNotes,
    handleSubmitQuote,
    handleAcceptRequest,
    handleDeclineRequest,
    selectedDate,
    setSelectedDate,
    handleStartJob,
    handleCompleteJob,
    responseDialogOpen,
    setResponseDialogOpen,
    selectedReview,
    setSelectedReview,
    responseText,
    setResponseText,
    handleSubmitResponse,
    isVerificationReady,
    isPendingReview,
    needsOnboarding,
    navigateToSection,
  };

  return (
    <ProviderDashboardProvider value={contextValue}>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-3 py-4">
            <Link to="/dashboard/provider" className="flex items-center gap-2">
              <img src={logo} alt="Hopterlink" className="h-7 w-auto" />
            </Link>
          </SidebarHeader>
          <SidebarSeparator />
          <SidebarContent>
            {navigationSections.map((section) => (
              <SidebarGroup key={section.items.join("-")} className="px-2">
                {section.title && (
                  <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                )}
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((itemId) => {
                      const item = navigationItems.find(
                        (navItem) => navItem.id === itemId,
                      );
                      if (!item) return null;
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      const isRestricted =
                        (needsOnboarding || isPendingReview) &&
                        restrictedSections.includes(item.id);
                      return (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            onClick={() => handleSectionChange(item.id)}
                            disabled={isRestricted}
                            aria-disabled={isRestricted}
                            isActive={isActive}
                            tooltip={item.label}
                            className="cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.label}</span>
                            {item.badge && (
                              <Badge className="ml-auto bg-red-500 text-white">
                                {item.badge}
                              </Badge>
                            )}
                            {item.id === "messages" &&
                              unreadMessages > 0 &&
                              !item.badge && (
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
          <ProviderDashboardHeader
            providerName={providerData.name}
            unreadNotifications={unreadNotifications}
          />

          <div className="flex-1 p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold mb-2">
                  {
                    navigationItems.find((item) => item.id === activeSection)
                      ?.label
                  }
                </h1>
                {activeSection === "overview" && (
                  <p className="text-gray-600">
                    Welcome back,{" "}
                    {(providerData.name || "Provider").split(" ")[0]}! 👋
                  </p>
                )}
              </div>

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
    </ProviderDashboardProvider>
  );
}
