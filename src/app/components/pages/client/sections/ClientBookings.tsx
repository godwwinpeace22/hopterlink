import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { BookingItem } from "../ClientDashboardContext";
import { Link, useNavigate } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../../../ui/button";
import { PageHeader } from "../../../ui/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Calendar, MapPin, Star } from "lucide-react";

export const ClientBookings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null,
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewExists, setReviewExists] = useState(false);
  const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [releaseConfirmBooking, setReleaseConfirmBooking] =
    useState<BookingItem | null>(null);
  const [isReleasingEscrow, setIsReleasingEscrow] = useState(false);

  const handleReleaseEscrow = async (booking: BookingItem) => {
    setIsReleasingEscrow(true);
    setErrorMessage(null);
    try {
      const { error } = await supabase.rpc("release_escrow", {
        p_booking_id: booking.id,
      });
      if (error) throw error;
      setReleaseConfirmBooking(null);
      refetchBookings();
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : t("clientBookings.releasePaymentError"),
      );
    } finally {
      setIsReleasingEscrow(false);
    }
  };

  const { data: bookingsResult, refetch: refetchBookings } = useSupabaseQuery(
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

  const { data: reviewsResult, refetch: refetchReviews } = useSupabaseQuery(
    ["client_reviews", user?.id],
    () =>
      supabase
        .from("reviews")
        .select("booking_id")
        .eq("reviewer_id", user?.id ?? ""),
    { enabled: Boolean(user?.id) },
  );

  const getFirst = <T,>(value: T | T[] | null | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const bookings = useMemo<BookingItem[]>(() => {
    if (!bookingsResult?.data) return [];
    const reviewedBookingIds = new Set(
      (reviewsResult?.data ?? []).map((r) => r.booking_id),
    );
    return bookingsResult.data.map((booking) => {
      const scheduledDate = booking.scheduled_date
        ? new Date(booking.scheduled_date)
        : null;
      const status =
        booking.status === "completed"
          ? "completed"
          : booking.status === "in_progress"
            ? "in-progress"
            : booking.status === "cancelled" || booking.status === "disputed"
              ? "cancelled"
              : "upcoming";
      const provider = getFirst(booking.provider);
      const providerProfile = getFirst(provider?.provider_profiles ?? []);
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
    });
  }, [bookingsResult, reviewsResult]);

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
      if (error) throw error;
      await refetchReviews();
      setReviewDialogOpen(false);
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to submit review.",
      );
    } finally {
      setIsReviewSubmitting(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!user?.id) {
      setErrorMessage("You must be signed in to cancel a booking.");
      return;
    }
    setCancellingBookingId(bookingId);
    setErrorMessage(null);
    try {
      const { error } = await supabase.rpc("cancel_booking", {
        p_booking_id: bookingId,
        p_reason: "Cancelled by client",
      });
      if (error) throw error;
      await refetchBookings();
      setSelectedBooking((prev) => (prev?.id === bookingId ? null : prev));
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to cancel booking.",
      );
    } finally {
      setCancellingBookingId(null);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <PageHeader title={t("clientBookings.title")} hideBack />
      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{t("clientBookings.title")}</CardTitle>
          <CardDescription>{t("clientBookings.cardDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          {(() => {
            const upcomingBookings = bookings.filter(
              (b: any) => b.status === "upcoming",
            );
            const inProgressBookings = bookings.filter(
              (b: any) => b.status === "in-progress",
            );
            const completedBookings = bookings.filter(
              (b: any) => b.status === "completed",
            );
            const cancelledBookings = bookings.filter(
              (b: any) => b.status === "cancelled",
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
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="upcoming">
                    {t("clientBookings.tabUpcoming")} ({upcomingBookings.length}
                    )
                  </TabsTrigger>
                  <TabsTrigger value="in-progress">
                    {t("clientBookings.tabInProgress")} (
                    {inProgressBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    {t("clientBookings.tabCompleted")} (
                    {completedBookings.length})
                  </TabsTrigger>
                  <TabsTrigger value="cancelled">
                    {t("clientBookings.tabCancelled")} (
                    {cancelledBookings.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="space-y-4 mt-6">
                  {upcomingBookings.length === 0
                    ? renderEmpty(
                        t("clientBookings.emptyUpcoming"),
                        t("clientBookings.emptyUpcomingDesc"),
                      )
                    : upcomingBookings.map((booking: any) => {
                        const canMessage = [
                          "confirmed",
                          "in_progress",
                          "completed",
                        ].includes(booking.bookingStatus ?? "");

                        return (
                          <Card key={booking.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-[#F1A400] text-white text-lg">
                                      {booking.provider
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        ?.slice(0, 2)
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-lg text-gray-900">
                                        {booking.service}
                                      </h3>
                                      <Badge
                                        className={
                                          booking.bookingStatus === "pending"
                                            ? "bg-amber-500"
                                            : "bg-[#F1A400] text-slate-950"
                                        }
                                      >
                                        {booking.bookingStatus === "pending"
                                          ? t("clientBookings.statusPending")
                                          : t("clientBookings.statusConfirmed")}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {booking.providerId ? (
                                        <Link
                                          to="/dashboard/client/profile/$userId"
                                          params={{
                                            userId: booking.providerId ?? "",
                                          }}
                                          className="text-[#F1A400] hover:underline"
                                        >
                                          {booking.provider}
                                        </Link>
                                      ) : (
                                        booking.provider
                                      )}
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
                                        {t("clientBookings.paymentLabel")}:{" "}
                                        {booking.escrowStatus ??
                                          booking.paymentStatus ??
                                          "pending"}
                                      </p>
                                      <p className="font-bold text-gray-900 mt-2">
                                        {t("clientBookings.price", {
                                          defaultValue: "Price",
                                        })}
                                        : ${booking.price}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#F7C876] text-[#8A5A00] hover:bg-[#FFF7E8]"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setDetailsDialogOpen(true);
                                    }}
                                  >
                                    {t("clientBookings.viewDetails")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      canMessage && booking.providerId
                                        ? navigate(
                                            "/dashboard/client/messages",
                                            {
                                              state: {
                                                recipientId: booking.providerId,
                                                bookingId: booking.id,
                                                recipientName: booking.provider,
                                                contextLabel: `Booking: ${booking.service}`,
                                              },
                                            },
                                          )
                                        : undefined
                                    }
                                    disabled={
                                      !canMessage || !booking.providerId
                                    }
                                  >
                                    {t("clientBookings.contactProvider")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                    onClick={() =>
                                      handleCancelBooking(booking.id)
                                    }
                                    disabled={
                                      cancellingBookingId === booking.id ||
                                      !["pending", "confirmed"].includes(
                                        booking.bookingStatus ?? "",
                                      )
                                    }
                                  >
                                    {cancellingBookingId === booking.id
                                      ? t("clientBookings.cancelling")
                                      : t("clientBookings.cancelBooking")}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-4 mt-6">
                  {inProgressBookings.length === 0
                    ? renderEmpty(
                        t("clientBookings.emptyInProgress"),
                        t("clientBookings.emptyInProgressDesc"),
                      )
                    : inProgressBookings.map((booking: any) => {
                        const canMessage = [
                          "confirmed",
                          "in_progress",
                          "completed",
                        ].includes(booking.bookingStatus ?? "");

                        return (
                          <Card key={booking.id}>
                            <CardContent className="pt-6">
                              <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarFallback className="bg-[#F1A400] text-white text-lg">
                                      {booking.provider
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        ?.slice(0, 2)
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-lg text-gray-900">
                                        {booking.service}
                                      </h3>
                                      <Badge className="bg-orange-500">
                                        {t("clientBookings.statusInProgress")}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {booking.providerId ? (
                                        <Link
                                          to="/dashboard/client/profile/$userId"
                                          params={{
                                            userId: booking.providerId ?? "",
                                          }}
                                          className="text-[#F1A400] hover:underline"
                                        >
                                          {booking.provider}
                                        </Link>
                                      ) : (
                                        booking.provider
                                      )}
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
                                        {t("clientBookings.started")}:{" "}
                                        {booking.date} at {booking.time}
                                      </p>
                                      <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        {booking.address}
                                      </p>
                                      <p className="font-bold text-gray-900 mt-2">
                                        {t("clientBookings.price")}: $
                                        {booking.price}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="border-[#F7C876] text-[#8A5A00] hover:bg-[#FFF7E8]"
                                    onClick={() => {
                                      setSelectedBooking(booking);
                                      setDetailsDialogOpen(true);
                                    }}
                                  >
                                    {t("clientBookings.viewDetails")}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      canMessage && booking.providerId
                                        ? navigate(
                                            "/dashboard/client/messages",
                                            {
                                              state: {
                                                recipientId: booking.providerId,
                                                bookingId: booking.id,
                                                recipientName: booking.provider,
                                                contextLabel: `Booking: ${booking.service}`,
                                              },
                                            },
                                          )
                                        : undefined
                                    }
                                    disabled={
                                      !canMessage || !booking.providerId
                                    }
                                  >
                                    {t("clientBookings.contactProvider")}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4 mt-6">
                  {completedBookings.length === 0
                    ? renderEmpty(
                        t("clientBookings.emptyCompleted"),
                        t("clientBookings.emptyCompletedDesc"),
                      )
                    : completedBookings.map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="bg-green-600 text-white text-lg">
                                    {booking.provider
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      ?.slice(0, 2)
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">
                                      {booking.service}
                                    </h3>
                                    <Badge className="bg-green-600">
                                      {t("clientBookings.statusCompleted")}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {booking.providerId ? (
                                      <Link
                                        to="/dashboard/client/profile/$userId"
                                        params={{
                                          userId: booking.providerId ?? "",
                                        }}
                                        className="text-[#F1A400] hover:underline"
                                      >
                                        {booking.provider}
                                      </Link>
                                    ) : (
                                      booking.provider
                                    )}
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
                                      {t("clientBookings.completedLabel")}:{" "}
                                      {booking.date}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      {t("clientBookings.paymentLabel")}:{" "}
                                      {booking.escrowStatus ??
                                        booking.paymentStatus ??
                                        "pending"}
                                    </p>
                                    <p className="font-bold text-green-600 mt-2">
                                      {t("clientBookings.paidLabel")}: $
                                      {booking.price}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-[#F7C876] text-[#8A5A00] hover:bg-[#FFF7E8]"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setDetailsDialogOpen(true);
                                  }}
                                >
                                  {t("clientBookings.viewDetails")}
                                </Button>
                                {booking.escrowStatus === "held" ||
                                booking.escrowStatus === "pending" ? (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 text-white hover:bg-green-700"
                                    onClick={() =>
                                      setReleaseConfirmBooking(booking)
                                    }
                                  >
                                    {t("clientBookings.releasePayment")}
                                  </Button>
                                ) : (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-green-700 border-green-300 justify-center py-1"
                                  >
                                    {t("clientBookings.paymentAlreadyReleased")}
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  className="bg-[#F1A400] text-slate-950 hover:bg-[#EFA055]"
                                  onClick={() => {
                                    setSelectedBooking(booking);
                                    setReviewDialogOpen(true);
                                  }}
                                  disabled={Boolean(booking.hasReview)}
                                >
                                  <Star className="h-4 w-4 mr-2" />
                                  {booking.hasReview
                                    ? t("clientBookings.reviewExists")
                                    : t("clientBookings.leaveReview")}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                </TabsContent>

                <TabsContent value="cancelled" className="space-y-4 mt-6">
                  {cancelledBookings.length === 0
                    ? renderEmpty(
                        t("clientBookings.emptyCancelled"),
                        t("clientBookings.emptyCancelledDesc"),
                      )
                    : cancelledBookings.map((booking: any) => (
                        <Card key={booking.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                  <AvatarFallback className="bg-gray-500 text-white text-lg">
                                    {booking.provider
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      ?.slice(0, 2)
                                      .join("")}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-lg text-gray-900">
                                      {booking.service}
                                    </h3>
                                    <Badge
                                      className={
                                        booking.bookingStatus === "disputed"
                                          ? "bg-red-600"
                                          : "bg-gray-500"
                                      }
                                    >
                                      {booking.bookingStatus === "disputed"
                                        ? t("clientBookings.statusDisputed")
                                        : t("clientBookings.statusCancelled")}
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {booking.providerId ? (
                                      <Link
                                        to="/dashboard/client/profile/$userId"
                                        params={{
                                          userId: booking.providerId ?? "",
                                        }}
                                        className="text-[#F1A400] hover:underline"
                                      >
                                        {booking.provider}
                                      </Link>
                                    ) : (
                                      booking.provider
                                    )}
                                  </p>
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
                                      {t("clientBookings.paymentLabel")}:{" "}
                                      {booking.escrowStatus ??
                                        booking.paymentStatus ??
                                        "pending"}
                                    </p>
                                    <p className="font-bold text-gray-900 mt-2">
                                      {t("clientBookings.price")}: $
                                      {booking.price}
                                    </p>
                                  </div>
                                </div>
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

      <Dialog
        open={releaseConfirmBooking !== null}
        onOpenChange={(open) => !open && setReleaseConfirmBooking(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("clientBookings.releasePaymentConfirmTitle")}
            </DialogTitle>
            <DialogDescription>
              {t("clientBookings.releasePaymentConfirmDesc", {
                amount: releaseConfirmBooking?.price ?? 0,
              })}
            </DialogDescription>
          </DialogHeader>
          {errorMessage && (
            <p className="text-sm text-destructive">{errorMessage}</p>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setReleaseConfirmBooking(null)}
              disabled={isReleasingEscrow}
            >
              {t("clientBookings.releasePaymentCancel")}
            </Button>
            <Button
              className="bg-green-600 text-white hover:bg-green-700"
              onClick={() =>
                releaseConfirmBooking &&
                handleReleaseEscrow(releaseConfirmBooking)
              }
              disabled={isReleasingEscrow}
            >
              {isReleasingEscrow
                ? t("clientBookings.releasingPayment")
                : t("clientBookings.releasePaymentConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clientBookings.reviewTitle")}</DialogTitle>
            <DialogDescription>{selectedBooking?.provider}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              {reviewExists && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  {t("clientBookings.reviewExists")}
                </div>
              )}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-semibold">{selectedBooking.service}</p>
                <p className="text-sm text-gray-600">
                  {selectedBooking.provider}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t("clientBookings.reviewLabel")}
                </label>
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
                  {t("clientBookings.reviewTitle")}
                </label>
                <textarea
                  className="w-full border rounded-md p-3 min-h-[120px]"
                  placeholder={t("clientBookings.reviewCommentPlaceholder")}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitReview}
                  className="flex-1 bg-[#F1A400] text-slate-950 hover:bg-[#EFA055]"
                  disabled={
                    reviewRating === 0 || reviewExists || isReviewSubmitting
                  }
                >
                  {isReviewSubmitting
                    ? t("clientBookings.reviewSubmitting")
                    : t("clientBookings.reviewSubmit")}
                </Button>
                <Button
                  onClick={() => {
                    setReviewDialogOpen(false);
                    setReviewRating(0);
                    setReviewComment("");
                  }}
                  variant="outline"
                >
                  {t("common.cancel")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("clientBookings.bookingDetails")}</DialogTitle>
            <DialogDescription>{selectedBooking?.service}</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-[#F7C876]/60 bg-[#FFF7E8] p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A6500]">
                      {t("clientBookings.service")}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {selectedBooking.service}
                    </p>
                    <p className="text-sm text-slate-600">
                      {t("clientBookings.withProvider", {
                        name: selectedBooking.provider,
                      })}
                    </p>
                  </div>
                  <Badge className="bg-white text-[#8A5A00] hover:bg-white">
                    {selectedBooking.status.replace("-", " ")}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t("clientBookings.schedule")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedBooking.date} at {selectedBooking.time}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t("clientBookings.total")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    ${selectedBooking.price}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t("clientBookings.address")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedBooking.address ||
                      t("clientBookings.addressNotProvided")}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t("clientBookings.paymentStatus")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {selectedBooking.escrowStatus ??
                      selectedBooking.paymentStatus ??
                      "pending"}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {t("clientBookings.providerRating")}
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-900">
                    {t("clientBookings.ratingOutOf", {
                      rating: selectedBooking.providerRating.toFixed(1),
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="border-[#F7C876] text-[#8A5A00] hover:bg-[#FFF7E8]"
                  onClick={() => {
                    setDetailsDialogOpen(false);
                    if (selectedBooking.providerId) {
                      navigate("/dashboard/client/messages", {
                        state: {
                          recipientId: selectedBooking.providerId,
                          bookingId: selectedBooking.id,
                          recipientName: selectedBooking.provider,
                          contextLabel: `Booking: ${selectedBooking.service}`,
                        },
                      });
                    }
                  }}
                  disabled={!selectedBooking.providerId}
                >
                  {t("clientBookings.contactProvider")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setDetailsDialogOpen(false)}
                >
                  {t("common.close")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
