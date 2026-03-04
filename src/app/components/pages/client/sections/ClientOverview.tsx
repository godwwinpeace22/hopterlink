import { useClientDashboard } from "../ClientDashboardContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  Gift,
  MessageSquare,
  Plus,
  Star,
  User,
} from "lucide-react";

const ClientStatsCards = () => {
  const { bookings, unreadMessages, clientData } = useClientDashboard();

  return (
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
                {bookings.filter((b: any) => b.status !== "completed").length}
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
                {bookings.filter((b: any) => b.status === "completed").length}
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
};

export const ClientOverview = () => {
  const navigate = useNavigate();
  const { bookings, messages, unreadMessages, navigateToSection } =
    useClientDashboard();

  return (
    <div className="space-y-6">
      <ClientStatsCards />

      {/* <Card className="border-2 border-[#F7C876] bg-gradient-to-r from-[#FDEFD6] to-white">
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
                  onClick={() => navigateToSection("post-job")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Post a New Job
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigateToSection("my-jobs")}
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
      </Card> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                .filter((b: any) => b.status === "upcoming")
                .map((booking: any) => (
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
                onClick={() => navigateToSection("bookings")}
              >
                View All Bookings
              </Button>
            </div>
          </CardContent>
        </Card>

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
              {messages.map((message: any) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 pb-4 border-b last:border-0 ${message.unread ? "bg-blue-50 -mx-6 px-6 py-3" : ""}`}
                >
                  <Avatar>
                    <AvatarFallback>
                      {message.provider
                        .split(" ")
                        .map((n: string) => n[0])
                        ?.slice(0, 2)
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
                onClick={() => navigateToSection("messages")}
              >
                View All Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
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
      </Card> */}
    </div>
  );
};
