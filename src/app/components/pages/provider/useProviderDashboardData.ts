import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import {
  type ProviderDashboardSection,
  type JobRequest,
  type AcceptedJob,
  type ProviderReview,
  type ProviderTransaction,
  type ProviderQuote,
  type ProviderData,
} from "./ProviderDashboardContext";

type VerificationStatus =
  | "not_started"
  | "pending"
  | "approved"
  | "rejected"
  | "expired";

const emptyProviderData: ProviderData = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  rating: 0,
  totalReviews: 0,
  completedJobs: 0,
  activeJobs: 0,
  pendingRequests: 0,
  earnings: { thisMonth: 0, lastMonth: 0, total: 0, pending: 0 },
  services: [],
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

const getFirst = <T>(value: T | T[] | null | undefined): T | undefined =>
  Array.isArray(value) ? value[0] : (value ?? undefined);

const getLocationLabel = (location: unknown): string => {
  if (location && typeof location === "object") {
    const address = (location as { address?: string }).address;
    const city = (location as { city?: string }).city;
    return address ?? city ?? "";
  }
  return "";
};

export function useProviderDashboardData() {
  const { user, memberships, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [providerData, setProviderData] =
    useState<ProviderData>(emptyProviderData);
  const [jobRequests, setJobRequests] = useState<JobRequest[]>([]);
  const [acceptedJobs, setAcceptedJobs] = useState<AcceptedJob[]>([]);
  const [reviews, setReviews] = useState<ProviderReview[]>([]);
  const [transactions, setTransactions] = useState<ProviderTransaction[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
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

  // --- Derived verification state ---

  const providerMembership = useMemo(
    () => memberships.find((m) => m.role === "provider"),
    [memberships],
  );
  const providerMembershipState = providerMembership?.state ?? "not_started";
  const isVerificationReady =
    !isAuthLoading && verificationStatus !== "loading";
  const isPendingReview =
    providerMembershipState === "pending_review" ||
    (providerMembership == null && verificationStatus === "pending");
  const needsOnboarding =
    providerMembershipState === "not_started" ||
    providerMembershipState === "onboarding" ||
    providerMembershipState === "rejected" ||
    verificationStatus === "expired" ||
    (providerMembership == null && verificationStatus === "rejected");
  const lockedSections: ProviderDashboardSection[] =
    providerMembershipState === "approved" && verificationStatus !== "expired"
      ? []
      : restrictedSections;

  // --- Navigation ---

  const normalizeSection = (
    value?: string | null,
  ): ProviderDashboardSection => {
    const candidate = value as ProviderDashboardSection | null | undefined;
    return candidate && dashboardSections.includes(candidate)
      ? candidate
      : "overview";
  };

  const activeSection: ProviderDashboardSection = (() => {
    const base = "/dashboard/provider";
    if (!location.pathname.startsWith(base)) return "overview";
    const remainder = location.pathname.slice(base.length).replace(/^\//, "");
    if (!remainder) return "overview";
    return normalizeSection(remainder.split("/")[0]);
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
    if (lockedSections.includes(section)) {
      const nextMessage = isPendingReview
        ? "Your provider application is under review. Work sections are locked until approval."
        : providerMembershipState === "rejected" ||
            verificationStatus === "rejected"
          ? "Your provider onboarding needs updates before work sections can be unlocked."
          : verificationStatus === "expired"
            ? "Your provider verification expired. Update onboarding to unlock work sections again."
            : "Complete provider onboarding to access jobs, earnings, and reviews.";
      setErrorMessage(nextMessage);
      if (needsOnboarding) navigate("/provider/onboarding");
      return;
    }
    navigateToSection(section);
  };

  // --- Queries ---

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
          `id, job_id, scheduled_date, status, amount, location, description, service_type,
          client:profiles!bookings_client_id_fkey (id, full_name)`,
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
          `id, amount, estimated_duration, message, status, created_at,
          booking:bookings!bookings_quote_id_fkey (id, status),
          job:jobs (
            id, title, category, location, budget_min, budget_max, created_at,
            client:profiles!jobs_client_id_fkey (id, full_name)
          )`,
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

  const { data: notificationsCountResult } = useSupabaseQuery(
    ["provider_unread_notifications", user?.id],
    () =>
      supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user?.id ?? "")
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
          `id, reviewer_id, rating, comment, response, response_at, is_verified, created_at,
          booking:bookings (service_type),
          reviewer:profiles!reviews_reviewer_id_fkey (full_name)`,
        )
        .eq("reviewee_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  // --- Effects ---

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
    if (!providerProfileResult) return;
    if (providerProfileResult.error) {
      setErrorMessage(providerProfileResult.error.message);
      return;
    }
    const pd = providerProfileResult.data;
    if (!pd) return;
    setProviderData((prev) => ({
      ...prev,
      businessName: pd.business_name ?? "",
      rating: pd.rating ?? 0,
      totalReviews: pd.total_reviews ?? 0,
      completedJobs: pd.jobs_completed ?? 0,
      services: pd.services ?? [],
      bio: pd.bio ?? "",
      earnings: {
        ...prev.earnings,
        total: pd.total_earned ?? 0,
      },
    }));
    setVerificationStatus(
      (pd.verification_status ?? "not_started") as VerificationStatus,
    );
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
          urgency: "flexible" as const,
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
      return { amount, status: payment.status ?? "pending", createdAt };
    });

    const totalReleased = mapped
      .filter((e) => e.status === "released")
      .reduce((sum, e) => sum + e.amount, 0);
    const pendingTotal = mapped
      .filter((e) => e.status === "pending" || e.status === "held")
      .reduce((sum, e) => sum + e.amount, 0);
    const monthReleased = mapped
      .filter(
        (e) =>
          e.status === "released" &&
          e.createdAt &&
          e.createdAt.getTime() >= monthStart.getTime(),
      )
      .reduce((sum, e) => sum + e.amount, 0);

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

  const providerQuotes = useMemo((): ProviderQuote[] => {
    if (quotesResult?.error) {
      setErrorMessage(quotesResult.error.message);
      return [];
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
    if (messagesResult?.error) {
      setErrorMessage(messagesResult.error.message);
    } else if (typeof messagesResult?.count === "number") {
      setUnreadMessages(messagesResult.count);
    }
  }, [messagesResult]);

  useEffect(() => {
    if (notificationsCountResult?.error) {
      setErrorMessage(notificationsCountResult.error.message);
    } else if (typeof notificationsCountResult?.count === "number") {
      setUnreadNotifications(notificationsCountResult.count);
    }
  }, [notificationsCountResult]);

  useEffect(() => {
    if (!user?.id) return;

    const refreshUnreadMessages = async () => {
      const { count, error } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", user.id)
        .eq("is_read", false);
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setUnreadMessages(count ?? 0);
    };

    const channel = supabase
      .channel(`provider-dashboard-unread-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user.id}`,
        },
        () => void refreshUnreadMessages(),
      )
      .subscribe();

    return () => void supabase.removeChannel(channel);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    const refreshUnreadNotifications = async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_read", false);
      if (error) {
        setErrorMessage(error.message);
        return;
      }
      setUnreadNotifications(count ?? 0);
    };

    const channel = supabase
      .channel(`provider-dashboard-notifications-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => void refreshUnreadNotifications(),
      )
      .subscribe();

    return () => void supabase.removeChannel(channel);
  }, [user?.id]);

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

  // --- Handlers ---

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

  const handleStartJob = async (jobId: string) => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to update a job.");
      return;
    }
    const { error } = await supabase.rpc("start_booking", {
      p_booking_id: jobId,
    });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await Promise.all([refetchBookings(), refetchQuotes()]);
    setAcceptedJobs((prev) =>
      prev.map((item) =>
        item.id === jobId ? { ...item, status: "in-progress" } : item,
      ),
    );
  };

  const handleCompleteJob = async (jobId: string) => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to update a job.");
      return;
    }
    const { error } = await supabase.rpc("complete_booking", {
      p_booking_id: jobId,
    });
    if (error) {
      setErrorMessage(error.message);
      return;
    }
    await Promise.all([refetchBookings(), refetchQuotes()]);
    setAcceptedJobs((prev) =>
      prev.map((item) =>
        item.id === jobId ? { ...item, status: "completed" } : item,
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

  return {
    // Data
    providerData,
    jobRequests,
    acceptedJobs,
    providerQuotes,
    transactions,
    reviews,
    errorMessage,
    unreadMessages,
    unreadNotifications,
    // Navigation
    activeSection,
    navigateToSection,
    handleSectionChange,
    navigate,
    // Verification
    isVerificationReady,
    isPendingReview,
    needsOnboarding,
    verificationStatus,
    lockedSections,
    // Quote dialog
    quoteDialogOpen,
    setQuoteDialogOpen,
    selectedJobRequest,
    setSelectedJobRequest,
    quoteAmount,
    setQuoteAmount,
    quoteNotes,
    setQuoteNotes,
    // Schedule
    selectedDate,
    setSelectedDate,
    // Review response dialog
    responseDialogOpen,
    setResponseDialogOpen,
    selectedReview,
    setSelectedReview,
    responseText,
    setResponseText,
    // Handlers
    handleAcceptRequest,
    handleDeclineRequest,
    handleSubmitQuote,
    handleStartJob,
    handleCompleteJob,
    handleSubmitResponse,
  };
}
