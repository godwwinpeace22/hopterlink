import { useClientDashboard } from "../ClientDashboardContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
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
  DialogHeader,
  DialogTitle,
} from "../../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import { Calendar, MapPin, Star } from "lucide-react";

export const ClientBookings = () => {
  const navigate = useNavigate();
  const {
    bookings,
    reviewDialogOpen,
    setReviewDialogOpen,
    selectedBooking,
    setSelectedBooking,
    reviewRating,
    setReviewRating,
    reviewComment,
    setReviewComment,
    reviewExists,
    isReviewSubmitting,
    handleSubmitReview,
  } = useClientDashboard();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Bookings</CardTitle>
          <CardDescription>Manage your service appointments</CardDescription>
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
                                    <AvatarFallback className="bg-blue-600 text-white text-lg">
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
                                      <Badge className="bg-blue-600">
                                        Upcoming
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {booking.providerId ? (
                                        <Link
                                          to={`/dashboard/client/profile/${booking.providerId}`}
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
                        );
                      })}
                </TabsContent>

                <TabsContent value="in-progress" className="space-y-4 mt-6">
                  {inProgressBookings.length === 0
                    ? renderEmpty(
                        "No active bookings",
                        "You have no bookings in progress right now.",
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
                                    <AvatarFallback className="bg-blue-600 text-white text-lg">
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
                                        In Progress
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {booking.providerId ? (
                                        <Link
                                          to={`/dashboard/client/profile/${booking.providerId}`}
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
                                        Started: {booking.date} at{" "}
                                        {booking.time}
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
                                    Contact Provider
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
                        "No completed bookings",
                        "Finished services will appear here.",
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
                                      Completed
                                    </Badge>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">
                                    {booking.providerId ? (
                                      <Link
                                        to={`/dashboard/client/profile/${booking.providerId}`}
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
                                {/* <Button size="sm" variant="outline">
                                  View Receipt
                                </Button> */}
                                {/* <Button size="sm" variant="outline">
                                  Book Again
                                </Button> */}
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
};
