import { Link } from "@/lib/router";
import { useTranslation } from "react-i18next";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { PageHeader } from "../../../ui/page-header";
import { Avatar, AvatarFallback } from "../../../ui/avatar";
import { Badge } from "../../../ui/badge";
import { useProviderDashboard } from "../ProviderDashboardContext";
import { useProviderGetJobs } from "@/app/hooks/useProviderGetJobs";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertCircle,
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
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
  const { t } = useTranslation();
  const { providerData, jobRequests, acceptedJobs, navigateToSection } =
    useProviderDashboard();
  const { user, profile } = useAuth();
  const { jobs: availableJobs, isLoading: jobsLoading } = useProviderGetJobs(
    user?.id,
    profile?.country ?? null,
  );
  const previewJobs = availableJobs.filter((j) => !j.hasQuoted).slice(0, 4);

  const upcomingJobs = acceptedJobs.filter((job) => job.status === "upcoming");

  return (
    <div className="space-y-8 pt-6">
      <PageHeader title={t("providerOverview.title")} hideBack />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title={t("providerOverview.statPending")}
          value={providerData.pendingRequests.toString()}
          hint={t("providerOverview.statPendingHint")}
          icon={<AlertCircle className="h-5 w-5" />}
          iconClassName="bg-amber-100 text-amber-700"
        />
        <MetricCard
          title={t("providerOverview.statThisMonth")}
          value={formatCurrency(providerData.earnings.thisMonth)}
          hint={t("providerOverview.statThisMonthHint")}
          icon={<DollarSign className="h-5 w-5" />}
          iconClassName="bg-emerald-100 text-emerald-700"
        />
        <MetricCard
          title={t("providerOverview.statUpcoming")}
          value={upcomingJobs.length.toString()}
          hint={t("providerOverview.statUpcomingHint")}
          icon={<Calendar className="h-5 w-5" />}
          iconClassName="bg-[#FFF1D6] text-[#B87503]"
        />
        <MetricCard
          title={t("providerOverview.statRating")}
          value={providerData.rating.toFixed(1)}
          hint={t("providerOverview.statRatingHint", {
            count: providerData.totalReviews,
          })}
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
                {t("providerOverview.availabilityTitle")}
              </p>
              <p className="text-sm text-slate-500">
                {t("providerOverview.availabilitySubtitle")}
              </p>
            </div>
          </div>
          <Button
            className="shrink-0 bg-[#F7C876] text-slate-900 hover:bg-[#EFA055]"
            onClick={() => navigateToSection("calendar")}
          >
            {t("providerOverview.manageAvailability")}
          </Button>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-slate-950">
                {t("providerOverview.jobRequestsTitle")}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {t("providerOverview.jobRequestsSubtitle")}
              </p>
            </div>
            <Badge className="bg-amber-500 text-slate-950 hover:bg-amber-500">
              {jobRequests.length}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {jobRequests.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                {t("providerOverview.jobRequestsEmpty")}
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
              {t("providerOverview.viewAllJobRequests")}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-slate-950">
                {t("providerOverview.upcomingTitle")}
              </CardTitle>
              <p className="text-sm text-slate-500">
                {t("providerOverview.upcomingSubtitle")}
              </p>
            </div>
            <Wallet className="h-5 w-5 text-slate-400" />
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingJobs.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                {t("providerOverview.noUpcomingJobsYet")}
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
                      {t("providerOverview.scheduled")}
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
              {t("providerOverview.openJobs")}
            </Button>
          </CardContent>
        </Card>
      </section>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-slate-950">
              {t("providerOverview.availableJobsTitle", "Available Jobs")}
            </CardTitle>
            <p className="text-sm text-slate-500">
              {t(
                "providerOverview.availableJobsSubtitle",
                "Open jobs posted in your country",
              )}
            </p>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">
            {availableJobs.filter((j) => !j.hasQuoted).length}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {jobsLoading ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              Loading...
            </div>
          ) : previewJobs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              {t(
                "providerOverview.availableJobsEmpty",
                "No open jobs in your area right now.",
              )}
            </div>
          ) : (
            previewJobs.map((job) => (
              <Link
                key={job.id}
                to="/dashboard/provider/job-board"
                className="flex items-start gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50 transition-colors no-underline"
              >
                <div className="rounded-lg bg-[#FFF1D6] p-3 text-[#B87503] shrink-0">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-slate-950 truncate">
                      {job.title}
                    </p>
                    {job.budget ? (
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 shrink-0"
                      >
                        ${job.budget}
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-slate-500">{job.category}</p>
                  <p className="line-clamp-2 text-sm text-slate-400">
                    {job.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    {job.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                    ) : null}
                    {job.quotesCount > 0 ? (
                      <span>
                        {job.quotesCount} quote
                        {job.quotesCount !== 1 ? "s" : ""}
                      </span>
                    ) : null}
                    <span>{job.postedDate}</span>
                  </div>
                </div>
              </Link>
            ))
          )}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigateToSection("job-board")}
          >
            {t(
              "providerOverview.viewAllAvailableJobs",
              "View all available jobs",
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
