import { Link } from "@/lib/router";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { PageHeader } from "../../../ui/page-header";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { useProviderDashboard } from "../ProviderDashboardContext";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Star,
  Wallet,
} from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(value);

const MetricCard = ({
  title,
  value,
  hint,
  icon,
  iconClassName,
}: {
  title: string;
  value: string;
  hint: string;
  icon: React.ReactNode;
  iconClassName: string;
}) => (
  <Card className="border-slate-200 shadow-sm">
    <CardContent className="flex items-start justify-between p-5">
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-3xl font-semibold tracking-tight text-slate-950">
          {value}
        </p>
        <p className="text-sm text-slate-500">{hint}</p>
      </div>
      <div className={`rounded-full p-3 ${iconClassName}`}>{icon}</div>
    </CardContent>
  </Card>
);

export const ProviderOverview = () => {
  const { providerData, jobRequests, acceptedJobs, navigateToSection } =
    useProviderDashboard();

  const upcomingJobs = acceptedJobs.filter((job) => job.status === "upcoming");

  return (
    <div className="space-y-8 pt-6">
      <PageHeader title="Overview" hideBack />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Pending Requests"
          value={providerData.pendingRequests.toString()}
          hint="Waiting for your response"
          icon={<AlertCircle className="h-5 w-5" />}
          iconClassName="bg-amber-100 text-amber-700"
        />
        <MetricCard
          title="This Month"
          value={formatCurrency(providerData.earnings.thisMonth)}
          hint="Released earnings this month"
          icon={<DollarSign className="h-5 w-5" />}
          iconClassName="bg-emerald-100 text-emerald-700"
        />
        <MetricCard
          title="Upcoming Jobs"
          value={upcomingJobs.length.toString()}
          hint="Scheduled and confirmed"
          icon={<Calendar className="h-5 w-5" />}
          iconClassName="bg-[#FFF1D6] text-[#B87503]"
        />
        <MetricCard
          title="Rating"
          value={providerData.rating.toFixed(1)}
          hint={`${providerData.totalReviews} verified reviews`}
          icon={<Star className="h-5 w-5" />}
          iconClassName="bg-amber-100 text-amber-700"
        />
      </section>

      <Card className="border-slate-200 shadow-sm bg-gradient-to-r from-[#FFF8EC] to-white">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-[#FFF1D6] p-3 text-[#B87503]">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                Set your availability
              </p>
              <p className="text-sm text-slate-500">
                Let clients know when you're open for bookings.
              </p>
            </div>
          </div>
          <Button
            className="shrink-0 bg-[#F7C876] text-slate-900 hover:bg-[#EFA055]"
            onClick={() => navigateToSection("calendar")}
          >
            Manage Availability
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-slate-950">New job requests</CardTitle>
              <p className="text-sm text-slate-500">
                Recent requests waiting for a quote or response.
              </p>
            </div>
            <Badge className="bg-amber-500 text-slate-950 hover:bg-amber-500">
              {jobRequests.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobRequests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No pending requests right now.
              </div>
            ) : (
              jobRequests.slice(0, 4).map((request) => (
                <div
                  key={request.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-slate-900 text-white">
                      {request.client
                        .split(" ")
                        .map((name) => name[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">
                          {request.service}
                        </p>
                        <p className="text-sm text-slate-500">
                          {request.clientId ? (
                            <Link
                              to="/dashboard/provider/profile/$userId"
                              params={{ userId: request.clientId }}
                              className="text-amber-600 hover:underline"
                            >
                              {request.client}
                            </Link>
                          ) : (
                            request.client
                          )}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700"
                      >
                        ${request.budget}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-500">
                      {request.description}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{request.date}</span>
                      <span>{request.timePreference}</span>
                      <span>{request.address}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigateToSection("jobs")}
            >
              View all job requests
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-slate-950">Upcoming jobs</CardTitle>
              <p className="text-sm text-slate-500">
                Your next scheduled client bookings.
              </p>
            </div>
            <Wallet className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingJobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                No upcoming jobs yet.
              </div>
            ) : (
              upcomingJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="rounded-lg bg-[#FFF1D6] p-3 text-[#B87503]">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-950">
                          {job.service}
                        </p>
                        <p className="text-sm text-slate-500">
                          {job.clientId ? (
                            <Link
                              to="/dashboard/provider/profile/$userId"
                              params={{ userId: job.clientId }}
                              className="text-amber-600 hover:underline"
                            >
                              {job.client}
                            </Link>
                          ) : (
                            job.client
                          )}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">
                        ${job.price}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span>{job.date}</span>
                      <span>{job.time}</span>
                      <span>{job.address}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-[#F7C876] text-[#A15C00]"
                    >
                      Scheduled
                    </Badge>
                  </div>
                </div>
              ))
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigateToSection("jobs")}
            >
              Open jobs
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
