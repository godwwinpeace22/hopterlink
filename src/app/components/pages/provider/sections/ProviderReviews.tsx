import { useMemo, useState, type ChangeEvent } from "react";
import { useProviderDashboard } from "../ProviderDashboardContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Textarea } from "../../../ui/textarea";
import { CheckCircle, Star } from "lucide-react";

type GivenReview = {
  id: string;
  reviewee: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  verified: boolean;
};

type ReviewFilter = "received" | "given";

export const ProviderReviews = () => {
  const { user } = useAuth();
  const {
    providerData,
    reviews,
    setSelectedReview,
    setResponseText,
    setResponseDialogOpen,
    responseDialogOpen,
    selectedReview,
    responseText,
    handleSubmitResponse,
  } = useProviderDashboard();

  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("received");

  const { data: givenReviewsResult } = useSupabaseQuery(
    ["provider_given_reviews", user?.id],
    () =>
      supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
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

  const givenReviews: GivenReview[] = useMemo(() => {
    return (givenReviewsResult?.data ?? []).map((review) => {
      const reviewee = Array.isArray(review.reviewee)
        ? review.reviewee[0]
        : review.reviewee;
      const booking = Array.isArray(review.booking)
        ? review.booking[0]
        : review.booking;

      return {
        id: review.id,
        reviewee: reviewee?.full_name ?? "Client",
        rating: review.rating ?? 0,
        date: review.created_at
          ? new Date(review.created_at).toLocaleDateString("en-CA")
          : "",
        service: booking?.service_type ?? "Service",
        comment: review.comment ?? "",
        verified: review.is_verified ?? false,
      };
    });
  }, [givenReviewsResult]);

  const activeReviews = reviewFilter === "received" ? reviews : givenReviews;
  const hasReviews = activeReviews.length > 0;

  return (
    <>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">Reviews</CardTitle>
                <CardDescription className="mt-1">
                  Track your feedback history and public reputation.
                </CardDescription>
              </div>

              <div className="rounded-2xl border bg-gray-50 px-4 py-3 text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Overall rating
                </p>
                <div className="mt-1 flex items-center justify-end gap-2">
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="text-2xl font-semibold">
                    {providerData.rating.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {providerData.totalReviews} received reviews
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

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
                Received ({reviews.length})
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
                Given ({givenReviews.length})
              </button>
            </div>

            {!hasReviews && (
              <div className="rounded-xl border border-dashed px-6 py-10 text-center text-sm text-gray-600">
                {reviewFilter === "received"
                  ? "No received reviews yet."
                  : "No given reviews yet."}
              </div>
            )}

            {hasReviews && (
              <div className="space-y-4">
                {activeReviews.map((review: any) => (
                  <div
                    key={review.id}
                    className="rounded-2xl border bg-white px-5 py-4"
                  >
                    <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {reviewFilter === "received"
                            ? review.client
                            : review.reviewee}
                        </p>
                        <div className="flex gap-2 items-center">
                          <div className="text-sm capitalize bg-gray-100 w-fit px-2 rounded-2xl text-gray-600">
                            {review.service}
                          </div>
                          {review.verified && (
                            <div className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              Verified review
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="flex gap-1 sm:justify-end">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          {review.date}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-700">{review.comment}</p>

                    {reviewFilter === "received" && review.response && (
                      <div className="mt-4 rounded-lg bg-gray-50 px-4 py-3 text-sm">
                        <p className="font-semibold text-gray-800">
                          Your Response
                        </p>
                        <p className="mt-1 text-gray-700">{review.response}</p>
                      </div>
                    )}

                    {reviewFilter === "received" && !review.response && (
                      <div className="mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReview(review);
                            setResponseText("");
                            setResponseDialogOpen(true);
                          }}
                        >
                          Respond to review
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Review</DialogTitle>
            <DialogDescription>
              Share a public response to {selectedReview?.client}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              value={responseText}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) =>
                setResponseText(event.target.value)
              }
              placeholder="Write your response..."
              className="min-h-[140px]"
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setResponseDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={handleSubmitResponse}
                disabled={!responseText.trim()}
              >
                Submit Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
