import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import { CheckCircle, Clock, MapPin } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";

export const ProviderJobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("opportunities");
  const [opportunitiesFilter, setOpportunitiesFilter] = useState<
    "requests" | "quotes"
  >("requests");

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

  const { data: bookingsResult, refetch: refetchBookings } = useSupabaseQuery(
    ["provider_jobs_bookings", user?.id],
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

  const pendingBookings = useMemo(() => {
    return (bookingsResult?.data ?? [])
      .filter((booking: any) => booking.status === "pending")
      .map((booking: any) => {
        const scheduledDate = booking.scheduled_date
          ? new Date(booking.scheduled_date)
          : null;
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
          price: booking.amount ?? 0,
          address,
          description: booking.description ?? "",
        };
      });
  }, [bookingsResult]);

  const acceptedJobs = useMemo(() => {
    return (bookingsResult?.data ?? [])
      .filter((booking: any) =>
        ["confirmed", "in_progress", "completed"].includes(booking.status),
      )
      .map((booking: any) => {
        const scheduledDate = booking.scheduled_date
          ? new Date(booking.scheduled_date)
          : null;
        const status =
          booking.status === "completed"
            ? "completed"
            : booking.status === "in_progress"
              ? "in-progress"
              : booking.status === "confirmed"
                ? "upcoming"
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
  }, [bookingsResult]);

  const { data: quotesResult, refetch: refetchQuotes } = useSupabaseQuery(
    ["provider_jobs_quotes", user?.id],
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

  const providerQuotes = useMemo(() => {
    return (quotesResult?.data ?? []).map((quote: any) => {
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

  const resolveBookingId = async (quoteId: string) => {
    let query = supabase
      .from("bookings")
      .select("id, status")
      .eq("quote_id", quoteId);
    if (user?.id) {
      query = query.eq("provider_id", user.id);
    }
    const { data, error } = await query.limit(1).maybeSingle();
    if (error) {
      return null;
    }
    return data?.id ?? null;
  };

  const handleStartFromQuote = async (quote: any) => {
    const bookingId = quote.bookingId ?? (await resolveBookingId(quote.id));
    if (!bookingId) return;
    const { data: bookingData, error } = await supabase
      .from("bookings")
      .select("job_id")
      .eq("id", bookingId)
      .maybeSingle();
    if (error) return;

    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", bookingId)
      .eq("provider_id", user?.id ?? "");
    if (bookingError) return;

    if (bookingData?.job_id) {
      await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", bookingData.job_id);
    }

    await Promise.all([refetchBookings(), refetchQuotes()]);
    setActiveTab("in-progress");
  };

  const handleCompleteFromQuote = async (quote: any) => {
    const bookingId = quote.bookingId ?? (await resolveBookingId(quote.id));
    if (!bookingId) return;
    const { data: bookingData, error } = await supabase
      .from("bookings")
      .select("job_id")
      .eq("id", bookingId)
      .maybeSingle();
    if (error) return;

    const { error: bookingError } = await supabase
      .from("bookings")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", bookingId)
      .eq("provider_id", user?.id ?? "");
    if (bookingError) return;

    await supabase
      .from("escrow_payments")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("booking_id", bookingId)
      .eq("provider_id", user?.id ?? "");

    await supabase
      .from("bookings")
      .update({ payment_status: "released" })
      .eq("id", bookingId)
      .eq("provider_id", user?.id ?? "");

    if (bookingData?.job_id) {
      await supabase
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", bookingData.job_id);
    }

    await Promise.all([refetchBookings(), refetchQuotes()]);
    setActiveTab("completed");
  };

  const handleStartFromJob = async (job: any) => {
    if (!job?.id) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "in_progress", started_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("provider_id", user?.id ?? "");
    if (error) return;

    if (job.jobId) {
      await supabase
        .from("jobs")
        .update({ status: "in_progress" })
        .eq("id", job.jobId);
    }

    await Promise.all([refetchBookings(), refetchQuotes()]);
    setActiveTab("in-progress");
  };

  const handleCompleteFromJob = async (job: any) => {
    if (!job?.id) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "completed", completed_at: new Date().toISOString() })
      .eq("id", job.id)
      .eq("provider_id", user?.id ?? "");
    if (error) return;

    await supabase
      .from("escrow_payments")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("booking_id", job.id)
      .eq("provider_id", user?.id ?? "");

    await supabase
      .from("bookings")
      .update({ payment_status: "released" })
      .eq("id", job.id)
      .eq("provider_id", user?.id ?? "");

    if (job.jobId) {
      await supabase
        .from("jobs")
        .update({ status: "completed" })
        .eq("id", job.jobId);
    }

    await Promise.all([refetchBookings(), refetchQuotes()]);
    setActiveTab("completed");
  };

  const handleAcceptBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
      .eq("id", bookingId)
      .eq("provider_id", user?.id ?? "");
    if (error) return;
    await Promise.all([refetchBookings(), refetchQuotes()]);
    setActiveTab("upcoming");
  };

  const handleDeclineBooking = async (bookingId: string) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
      .eq("id", bookingId)
      .eq("provider_id", user?.id ?? "");
    if (error) return;
    await Promise.all([refetchBookings(), refetchQuotes()]);
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200/80 bg-white">
        <CardHeader className="">
          <CardTitle className="tracking-tight">My Jobs</CardTitle>
          <CardDescription>
            Manage your accepted and active jobs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-4 bg-[#FDEFD6]/60">
              <TabsTrigger value="opportunities">Requests & Quotes</TabsTrigger>
              <TabsTrigger value="upcoming">Accepted</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="space-y-6 mt-6">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={
                    opportunitiesFilter === "requests" ? "default" : "outline"
                  }
                  className={
                    opportunitiesFilter === "requests"
                      ? "bg-[#F7C876] hover:bg-[#EFA055]"
                      : "hover:border-[#F7C876]"
                  }
                  onClick={() => setOpportunitiesFilter("requests")}
                >
                  Requests
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={
                    opportunitiesFilter === "quotes" ? "default" : "outline"
                  }
                  className={
                    opportunitiesFilter === "quotes"
                      ? "bg-[#F7C876] hover:bg-[#EFA055]"
                      : "hover:border-[#F7C876]"
                  }
                  onClick={() => setOpportunitiesFilter("quotes")}
                >
                  Quotes
                </Button>
              </div>

              {opportunitiesFilter === "requests" ? (
                pendingBookings.length === 0 ? (
                  <Card className="border border-dashed border-[#F7C876]/60 bg-[#FDEFD6]/30">
                    <CardContent className="py-10 text-center text-gray-600">
                      No pending booking requests.
                    </CardContent>
                  </Card>
                ) : (
                  pendingBookings.map((booking) => (
                    <Card
                      key={booking.id}
                      className="border border-gray-200/80 bg-white hover:shadow-lg transition-all"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-900 tracking-tight">
                                {booking.service}
                              </h3>
                              <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-[#FDEFD6] text-[#F1A400] border-[#F7C876]">
                                Pending
                              </span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-600">
                              <span>
                                <strong>Client:</strong>{" "}
                                {booking.clientId ? (
                                  <Link
                                    to={`/dashboard/provider/profile/${booking.clientId}`}
                                    className="text-[#F1A400] hover:underline"
                                  >
                                    {booking.client}
                                  </Link>
                                ) : (
                                  <span>{booking.client}</span>
                                )}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {booking.date} at {booking.time}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                {booking.address}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                              {booking.description}
                            </p>
                            <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#FDEFD6] px-3 py-1 text-sm font-semibold text-[#F1A400]">
                              Price: ${booking.price}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="bg-[#F7C876] hover:bg-[#EFA055]"
                              onClick={() => handleAcceptBooking(booking.id)}
                            >
                              Accept Booking
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => handleDeclineBooking(booking.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )
              ) : providerQuotes.length === 0 ? (
                <Card className="border border-dashed border-[#F7C876]/60 bg-[#FDEFD6]/30">
                  <CardContent className="py-10 text-center text-gray-600">
                    No submitted quotes yet.
                  </CardContent>
                </Card>
              ) : (
                providerQuotes.map((quote: any) => {
                  const bookingStatus = quote.bookingStatus ?? null;
                  const normalizedStatus =
                    bookingStatus === "in_progress"
                      ? "in progress"
                      : bookingStatus === "completed"
                        ? "completed"
                        : bookingStatus
                          ? "accepted"
                          : (quote.status?.replace("_", " ") ?? "pending");
                  const statusLabel =
                    normalizedStatus === "in progress"
                      ? "In Progress"
                      : normalizedStatus === "completed"
                        ? "Completed"
                        : normalizedStatus === "accepted"
                          ? "Accepted"
                          : normalizedStatus === "rejected"
                            ? "Rejected"
                            : "Pending";
                  const statusClass =
                    normalizedStatus === "completed"
                      ? "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 border-green-200"
                      : normalizedStatus === "in progress"
                        ? "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 border-blue-200"
                        : normalizedStatus === "accepted"
                          ? "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-green-50 text-green-700 border-green-200"
                          : normalizedStatus === "rejected"
                            ? "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 border-red-200"
                            : "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium bg-[#FDEFD6] text-[#F1A400] border-[#F7C876]";
                  const canStart =
                    quote.status === "accepted" &&
                    bookingStatus !== "in_progress" &&
                    bookingStatus !== "completed";
                  const canComplete = bookingStatus === "in_progress";
                  const canMessage =
                    quote.status === "accepted" ||
                    ["confirmed", "in_progress", "completed"].includes(
                      bookingStatus ?? "",
                    );

                  return (
                    <Card
                      key={quote.id}
                      className="border border-gray-200/80 bg-white hover:shadow-lg transition-all"
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg text-gray-900 tracking-tight">
                                {quote.jobTitle}
                              </h3>
                              <span className={statusClass}>{statusLabel}</span>
                            </div>
                            <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-600">
                              <span>
                                <strong>Client:</strong>{" "}
                                {quote.clientId ? (
                                  <Link
                                    to={`/dashboard/provider/profile/${quote.clientId}`}
                                    className="text-[#F1A400] hover:underline"
                                  >
                                    {quote.clientName}
                                  </Link>
                                ) : (
                                  <span>{quote.clientName}</span>
                                )}
                              </span>
                              <span className="inline-flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                Submitted {quote.createdAt}
                              </span>
                              {quote.location && (
                                <span className="inline-flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  {quote.location}
                                </span>
                              )}
                            </div>
                            {quote.message && (
                              <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                                {quote.message}
                              </p>
                            )}
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                              <span className="inline-flex items-center rounded-full bg-[#FDEFD6] px-3 py-1 text-sm font-semibold text-[#F1A400]">
                                Quote: ${quote.amount}
                              </span>
                              {quote.budget && (
                                <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                                  Budget: ${quote.budget}
                                </span>
                              )}
                              <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                                {quote.timeline}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {canStart && (
                              <Button
                                size="sm"
                                className="bg-[#F7C876] hover:bg-[#EFA055]"
                                onClick={() => handleStartFromQuote(quote)}
                              >
                                Start Job
                              </Button>
                            )}
                            {canComplete && (
                              <Button
                                size="sm"
                                className="bg-[#F1A400] hover:bg-[#EFA055]"
                                onClick={() => handleCompleteFromQuote(quote)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </Button>
                            )}
                            {canMessage && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:border-[#F7C876]"
                                onClick={() =>
                                  navigate("/dashboard/provider/messages")
                                }
                              >
                                Message Client
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {["upcoming", "in-progress", "completed"].map((status) => {
              const statusJobs = acceptedJobs.filter(
                (job: any) => job.status === status,
              );
              const statusBadgeClass =
                status === "upcoming"
                  ? "bg-[#FDEFD6] text-[#F1A400] border-[#F7C876]"
                  : status === "in-progress"
                    ? "bg-blue-100 text-blue-700 border-blue-200"
                    : "bg-green-100 text-green-700 border-green-200";

              return (
                <TabsContent
                  key={status}
                  value={status}
                  className="space-y-4 mt-6"
                >
                  {statusJobs.length === 0 ? (
                    <Card className="border border-dashed border-[#F7C876]/60 bg-[#FDEFD6]/30">
                      <CardContent className="py-10 text-center text-gray-600">
                        No{" "}
                        {status === "upcoming"
                          ? "accepted"
                          : status.replace("-", " ")}{" "}
                        jobs yet.
                      </CardContent>
                    </Card>
                  ) : (
                    statusJobs.map((job: any) => (
                      <Card
                        key={job.id}
                        className="border border-gray-200/80 bg-white hover:shadow-lg transition-all"
                      >
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-lg text-gray-900 tracking-tight">
                                  {job.service}
                                </h3>
                                <span
                                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClass}`}
                                >
                                  {status === "upcoming"
                                    ? "Accepted"
                                    : status === "in-progress"
                                      ? "In Progress"
                                      : "Completed"}
                                </span>
                              </div>
                              <div className="mt-2 grid grid-cols-1 gap-1 text-sm text-gray-600">
                                <span>
                                  <strong>Client:</strong>{" "}
                                  {job.clientId ? (
                                    <Link
                                      to={`/dashboard/provider/profile/${job.clientId}`}
                                      className="text-[#F1A400] hover:underline"
                                    >
                                      {job.client}
                                    </Link>
                                  ) : (
                                    <span>{job.client}</span>
                                  )}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                  {job.date} at {job.time}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  {job.address}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                                {job.description}
                              </p>
                              <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[#FDEFD6] px-3 py-1 text-sm font-semibold text-[#F1A400]">
                                Price: ${job.price}
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              {job.jobId && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="hover:border-[#F7C876]"
                                  onClick={() =>
                                    navigate(
                                      `/dashboard/provider/job/${job.jobId}`,
                                    )
                                  }
                                >
                                  View Job
                                </Button>
                              )}
                              {status === "upcoming" && (
                                <Button
                                  size="sm"
                                  className="bg-[#F7C876] hover:bg-[#EFA055]"
                                  onClick={() => handleStartFromJob(job)}
                                >
                                  Start Job
                                </Button>
                              )}
                              {status === "in-progress" && (
                                <Button
                                  size="sm"
                                  className="bg-[#F1A400] hover:bg-[#EFA055]"
                                  onClick={() => handleCompleteFromJob(job)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Mark Complete
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:border-[#F7C876]"
                                onClick={() =>
                                  navigate("/dashboard/provider/messages")
                                }
                              >
                                Contact Client
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
