import { useProviderDashboard } from "../ProviderDashboardContext";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import {
  AlertCircle,
  Award,
  Briefcase,
  Clock,
  DollarSign,
  Shield,
  Star,
  TrendingUp,
} from "lucide-react";

const ProviderStatsCards = () => {
  const { providerData } = useProviderDashboard();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Pending Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {providerData.pendingRequests}
              </p>
              <p className="text-sm text-red-600 mt-1">Awaiting response</p>
            </div>
            <AlertCircle className="h-10 w-10 text-red-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            This Month&apos;s Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                ${providerData.earnings.thisMonth.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4" />
                +12% from last month
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Active Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {providerData.activeJobs}
              </p>
              <p className="text-sm text-gray-600 mt-1">In progress</p>
            </div>
            <Briefcase className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">
            Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-gray-900">
                {providerData.rating}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(providerData.rating) ? "fill-red-500 text-red-500" : "text-gray-300"}`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  ({providerData.totalReviews})
                </span>
              </div>
            </div>
            <Star className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const ProviderOverview = () => {
  const navigate = useNavigate();
  const {
    isVerificationReady,
    needsOnboarding,
    isPendingReview,
    jobRequests,
    acceptedJobs,
    navigateToSection,
  } = useProviderDashboard();

  return (
    <div className="space-y-6">
      {isVerificationReady && needsOnboarding && (
        <Card className="border border-amber-200 bg-amber-50/70 shadow-sm">
          <CardContent className="py-3 px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Finish your provider onboarding
                  </p>
                  <p className="text-xs text-gray-600">
                    Complete your profile & documents to unlock jobs and
                    earnings.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => navigate("/provider/onboarding")}
              >
                Continue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {isVerificationReady && isPendingReview && (
        <Card className="border border-blue-200 bg-blue-50/70 shadow-sm">
          <CardContent className="py-3 px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Verification under review
                  </p>
                  <p className="text-xs text-gray-600">
                    We’re reviewing your documents. Access unlocks after
                    approval.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/provider/verification")}
              >
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <ProviderStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              New Job Requests
              <Badge className="bg-red-600 text-white">
                {jobRequests.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {jobRequests.slice(0, 3).map((request: any) => (
                <div
                  key={request.id}
                  className="flex items-start gap-3 pb-3 border-b last:border-0"
                >
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {request.client
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">
                      {request.service}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.clientId ? (
                        <Link
                          to={`/dashboard/provider/profile/${request.clientId}`}
                          className="text-[#F1A400] hover:underline"
                        >
                          {request.client}
                        </Link>
                      ) : (
                        request.client
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.postedTime}
                    </p>
                  </div>
                  <Badge
                    className={
                      request.urgency === "urgent"
                        ? "bg-red-600"
                        : "bg-blue-600"
                    }
                  >
                    ${request.budget}
                  </Badge>
                </div>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigateToSection("jobs")}
              >
                View Job Requests
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Upcoming Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedJobs
                .filter((job: { status: string }) => job.status === "upcoming")
                .map((job: any) => (
                  <div
                    key={job.id}
                    className="flex items-start gap-4 pb-4 border-b last:border-0"
                  >
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">
                        {job.service}
                      </p>
                      <p className="text-sm text-gray-600">
                        {job.clientId ? (
                          <Link
                            to={`/dashboard/provider/profile/${job.clientId}`}
                            className="text-[#F1A400] hover:underline"
                          >
                            {job.client}
                          </Link>
                        ) : (
                          job.client
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.date} at {job.time}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">${job.price}</p>
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
                onClick={() => navigateToSection("jobs")}
              >
                View All Jobs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">
                  Unlock Badges & Earn More!
                </h3>
                <p className="text-purple-100">
                  Complete challenges, reduce commission rates, and grow your
                  business
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
};
