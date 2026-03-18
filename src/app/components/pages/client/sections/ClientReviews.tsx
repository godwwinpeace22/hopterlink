import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "../../../ui/page-header";
import { CheckCircle, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";

type ReviewFilter = "received" | "given";

type ReviewItem = {
  id: string;
  reviewerName: string;
  revieweeName: string;
  service: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
  response: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

const formatDate = (dateInput: string | null) => {
  if (!dateInput) return "";
  return dateFormatter.format(new Date(dateInput));
};

const renderStars = (rating: number) =>
  [1, 2, 3, 4, 5].map((star) => (
    <Star
      key={star}
      className={`h-4 w-4 ${
        star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"
      }`}
    />
  ));

export const ClientReviews = () => {
  const { user } = useAuth();
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("received");
  const { t } = useTranslation();

  const receivedReviewsQuery = useSupabaseQuery(
    ["client_received_reviews", user?.id],
    () =>
      supabase
        .from("reviews")
        .select(
          `
            id,
            rating,
            comment,
            response,
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

  const givenReviewsQuery = useSupabaseQuery(
    ["client_given_reviews", user?.id],
    () =>
      supabase
        .from("reviews")
        .select(
          `
            id,
            rating,
            comment,
            response,
            is_verified,
            created_at,
            booking:bookings (
              service_type
            ),
            reviewee:profiles!reviews_reviewee_id_fkey (
              full_name
            )
          `,
        )
        .eq("reviewer_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  const receivedReviews = useMemo<ReviewItem[]>(() => {
    return (receivedReviewsQuery.data?.data ?? []).map((review) => {
      const reviewer = Array.isArray(review.reviewer)
        ? review.reviewer[0]
        : review.reviewer;
      const booking = Array.isArray(review.booking)
        ? review.booking[0]
        : review.booking;

      return {
        id: review.id,
        reviewerName: reviewer?.full_name ?? "Provider",
        revieweeName: "You",
        service: booking?.service_type ?? "Service",
        rating: review.rating ?? 0,
        comment: review.comment ?? "",
        date: formatDate(review.created_at),
        verified: review.is_verified ?? false,
        response: review.response ?? null,
      };
    });
  }, [receivedReviewsQuery.data?.data]);

  const givenReviews = useMemo<ReviewItem[]>(() => {
    return (givenReviewsQuery.data?.data ?? []).map((review) => {
      const reviewee = Array.isArray(review.reviewee)
        ? review.reviewee[0]
        : review.reviewee;
      const booking = Array.isArray(review.booking)
        ? review.booking[0]
        : review.booking;

      return {
        id: review.id,
        reviewerName: "You",
        revieweeName: reviewee?.full_name ?? "Provider",
        service: booking?.service_type ?? "Service",
        rating: review.rating ?? 0,
        comment: review.comment ?? "",
        date: formatDate(review.created_at),
        verified: review.is_verified ?? false,
        response: review.response ?? null,
      };
    });
  }, [givenReviewsQuery.data?.data]);

  const activeReviews =
    reviewFilter === "received" ? receivedReviews : givenReviews;
  const hasReviews = activeReviews.length > 0;

  const overallRating = useMemo(() => {
    if (!receivedReviews.length) return 0;
    const total = receivedReviews.reduce(
      (sum, review) => sum + review.rating,
      0,
    );
    return total / receivedReviews.length;
  }, [receivedReviews]);

  const loadError =
    receivedReviewsQuery.data?.error?.message ??
    givenReviewsQuery.data?.error?.message ??
    null;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pt-6">
      <PageHeader title={t("clientReviews.title")} hideBack />
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">
                {t("clientReviews.title")}
              </CardTitle>
              <CardDescription className="mt-1">
                {t("clientReviews.description")}
              </CardDescription>
            </div>

            <div className="rounded-2xl border bg-gray-50 px-4 py-3 text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                {t("clientReviews.overallRating")}
              </p>
              <div className="mt-1 flex items-center justify-end gap-2">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-semibold">
                  {overallRating.toFixed(1)}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {t("clientReviews.receivedCount", {
                  count: receivedReviews.length,
                })}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loadError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {loadError}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 inline-flex rounded-full bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setReviewFilter("received")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                reviewFilter === "received"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("clientReviews.tabReceived")} ({receivedReviews.length})
            </button>
            <button
              type="button"
              onClick={() => setReviewFilter("given")}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                reviewFilter === "given"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("clientReviews.tabGiven")} ({givenReviews.length})
            </button>
          </div>

          {!hasReviews && !loadError && (
            <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-gray-600">
              {reviewFilter === "received"
                ? t("clientReviews.noReceived")
                : t("clientReviews.noGiven")}
            </div>
          )}

          {hasReviews && (
            <div className="space-y-4">
              {activeReviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-2xl border bg-white px-5 py-4"
                >
                  <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {reviewFilter === "received"
                          ? review.reviewerName
                          : review.revieweeName}
                      </p>
                      <p className="text-sm bg-gray-50 text-gray-600">
                        {review.service}
                      </p>
                      {review.verified && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" />
                          {t("clientReviews.verifiedBadge")}
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="flex gap-1 sm:justify-end">
                        {renderStars(review.rating)}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {review.date}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700">{review.comment}</p>

                  {review.response && (
                    <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                      <p className="font-semibold text-gray-800">
                        {t("clientReviews.response")}
                      </p>
                      <p className="mt-1 text-gray-700">{review.response}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
