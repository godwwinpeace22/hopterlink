import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "@/lib/router";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useAuth } from "@/contexts/AuthContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Star, ArrowLeft, Calendar, MapPin } from "lucide-react";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString();
};

const getLocationLabel = (location: unknown) => {
  if (location && typeof location === "object") {
    const address = (location as { address?: string }).address;
    const city = (location as { city?: string }).city;
    return address ?? city ?? "";
  }
  return "";
};

export const ProviderJobDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { jobId } = useParams();
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const {
    data: bookingResult,
    error: bookingError,
    refetch: refetchBooking,
  } = useSupabaseQuery(
    ["provider_job_details", user?.id, jobId],
    () =>
      supabase
        .from("bookings")
        .select(
          `
            id,
            status,
            scheduled_date,
            amount,
            location,
            description,
            service_type,
            job:jobs (
              id,
              title,
              category,
              description,
              status,
              budget_min,
              budget_max,
              preferred_date,
              urgency,
              location,
              created_at
            ),
            client:profiles!bookings_client_id_fkey (
              id,
              full_name
            )
          `,
        )
        .eq("provider_id", user?.id ?? "")
        .eq("job_id", jobId ?? "")
        .maybeSingle(),
    { enabled: Boolean(user?.id && jobId) },
  );

  const bookingId = bookingResult?.data?.id ?? null;
  const client = useMemo(() => {
    const rawClient = bookingResult?.data?.client;
    return Array.isArray(rawClient) ? rawClient[0] : rawClient;
  }, [bookingResult]);

  const job = useMemo(() => {
    const rawJob = bookingResult?.data?.job;
    return Array.isArray(rawJob) ? rawJob[0] : rawJob;
  }, [bookingResult]);

  const { data: reviewResult, refetch: refetchReview } = useSupabaseQuery(
    ["provider_job_review", user?.id, bookingId],
    () =>
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at")
        .eq("booking_id", bookingId ?? "")
        .eq("reviewer_id", user?.id ?? "")
        .maybeSingle(),
    { enabled: Boolean(user?.id && bookingId) },
  );

  const hasReview = Boolean(reviewResult?.data?.id);
  const isCompleted = bookingResult?.data?.status === "completed";

  const handleSubmitReview = async () => {
    if (!user?.id || !bookingId || !client?.id) {
      setReviewError(t("providerJobDetails.submitReviewError"));
      return;
    }

    if (reviewRating === 0) {
      setReviewError(t("providerJobDetails.selectRating"));
      return;
    }

    setReviewSubmitting(true);
    setReviewError(null);

    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        reviewer_id: user.id,
        reviewee_id: client.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
        is_verified: true,
      });

      if (error) {
        throw error;
      }

      setReviewComment("");
      setReviewRating(0);
      await Promise.all([refetchReview(), refetchBooking()]);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t("providerJobDetails.submitReviewFailed");
      setReviewError(message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (bookingError) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-red-600">
            {bookingError.message}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingResult?.data) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8 text-center text-gray-600">
            {t("providerJobDetails.notFound")}
          </CardContent>
        </Card>
      </div>
    );
  }

  const budgetDisplay =
    job?.budget_min && job?.budget_max
      ? `${job.budget_min}-${job.budget_max}`
      : (job?.budget_min ?? job?.budget_max ?? "");

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate("/dashboard/provider/jobs")}
        className="flex items-center gap-2 text-gray-600 hover:text-[#F7C876] transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        {t("providerJobDetails.backToJobs")}
      </button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            {job?.title ?? t("providerJobs.title")}
          </CardTitle>
          <p className="text-gray-600">
            {t("providerJobDetails.detailsSubtitle")}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                {t("providerJobDetails.status")}
              </p>
              <p className="font-semibold text-gray-900 capitalize">
                {bookingResult.data.status?.replace("_", " ")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("providerJobDetails.scheduled")}
              </p>
              <p className="font-semibold text-gray-900">
                {formatDate(bookingResult.data.scheduled_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("providerJobDetails.budget")}
              </p>
              <p className="font-semibold text-gray-900">{budgetDisplay}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {t("providerJobDetails.location")}
              </p>
              <p className="font-semibold text-gray-900">
                {getLocationLabel(bookingResult.data.location)}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">
              {t("providerJobDetails.client")}
            </p>
            <p className="text-gray-900 font-semibold">
              {client?.id ? (
                <Link
                  to={`/dashboard/provider/profile/${client.id}`}
                  className="text-[#F1A400] hover:underline"
                >
                  {client?.full_name ?? t("providerJobs.client")}
                </Link>
              ) : (
                (client?.full_name ?? t("providerJobs.client"))
              )}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-2">
              {t("providerJobDetails.description")}
            </p>
            <p className="text-gray-700 whitespace-pre-wrap">
              {job?.description ?? bookingResult.data.description ?? ""}
            </p>
          </div>

          {job?.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              {getLocationLabel(job.location)}
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {formatDate(job?.created_at)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("providerJobDetails.leaveReview")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCompleted && (
            <p className="text-sm text-gray-500">
              {t("providerJobDetails.reviewUnlock")}
            </p>
          )}
          {isCompleted && hasReview && (
            <div className="rounded-lg border border-green-100 bg-green-50/60 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${star <= (reviewResult?.data?.rating ?? 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="ml-1 font-medium text-gray-800">
                    {reviewResult?.data?.rating ?? 0}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  {t("providerJobDetails.reviewSubmitted")}
                </Badge>
              </div>
              {reviewResult?.data?.comment && (
                <p className="mt-3 text-sm text-gray-700">
                  {reviewResult.data.comment}
                </p>
              )}
              {reviewResult?.data?.created_at && (
                <p className="mt-2 text-xs text-gray-500">
                  {t("providerJobDetails.submittedOn", {
                    date: formatDate(reviewResult.data.created_at),
                  })}
                </p>
              )}
            </div>
          )}
          {reviewError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {reviewError}
            </div>
          )}

          {isCompleted && !hasReview && (
            <>
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  {t("providerJobDetails.rating")}
                </p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${star <= reviewRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  {t("providerJobDetails.comment")}
                </p>
                <Textarea
                  placeholder={t("providerJobDetails.commentPlaceholder")}
                  value={reviewComment}
                  onChange={(event) => setReviewComment(event.target.value)}
                  rows={4}
                />
              </div>
              <Button
                className="bg-[#F7C876] hover:bg-[#EFA055]"
                onClick={handleSubmitReview}
                disabled={reviewSubmitting}
              >
                {reviewSubmitting
                  ? t("providerJobDetails.submittingReview")
                  : t("providerJobDetails.submitReview")}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
