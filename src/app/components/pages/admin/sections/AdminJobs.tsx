import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Input } from "../../../ui/input";
import { Button } from "../../../ui/button";
import { Label } from "../../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import {
  Search,
  FileText,
  CalendarCheck,
  CreditCard,
  ChevronRight,
  User,
  MapPin,
  Clock,
  ExternalLink,
  AlertCircle,
  Mail,
  Phone,
} from "lucide-react";
import { Skeleton } from "../../../ui/skeleton";
import { useNavigate, useSearchParams } from "@/lib/router";
import { Sheet, SheetContent, SheetHeader } from "../../../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";

const PAGE_SIZE = 20;

function dateStartIso(date: string) {
  return `${date}T00:00:00.000Z`;
}

function dateEndIso(date: string) {
  return `${date}T23:59:59.999Z`;
}

function formatBudget(min?: number | null, max?: number | null) {
  if (min != null && max != null) return `$${min} - $${max}`;
  if (min != null) return `From $${min}`;
  if (max != null) return `Up to $${max}`;
  return "—";
}

function getJobStatusLabel(status?: string | null) {
  if (!status) return "Unknown";
  if (status === "quoted") return "Has Quotes";
  return status.replace("_", " ");
}

function getJobStatusBadgeClass(status?: string | null) {
  switch (status) {
    case "draft":
      return "bg-slate-200 text-slate-700";
    case "open":
      return "bg-blue-100 text-blue-700";
    case "quoted":
      return "bg-amber-100 text-amber-700";
    case "accepted":
      return "bg-cyan-100 text-cyan-700";
    case "in_progress":
      return "bg-violet-100 text-violet-700";
    case "completed":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "disputed":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-slate-200 text-slate-700";
  }
}

export function AdminJobs() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    | "all"
    | "draft"
    | "open"
    | "quoted"
    | "accepted"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "disputed"
  >("all");
  const [countryFilter, setCountryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const selectedJobId = searchParams.get("jobId");

  const setQueryParam = (key: string, value?: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const openJobDetails = (jobId: string) => setQueryParam("jobId", jobId);
  const closeJobDetails = () => setQueryParam("jobId", null);

  const { data: jobs, isLoading } = useQuery({
    queryKey: [
      "admin",
      "jobs",
      search,
      statusFilter,
      countryFilter,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select(
          "id, title, status, category, budget_min, budget_max, quotes_count, created_at, client_id, client:profiles!jobs_client_id_fkey!inner(full_name,country)",
        )
        .order("created_at", { ascending: false })
        .limit(500);

      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`,
        );
      }

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      if (countryFilter.trim()) {
        query = (query as any).eq(
          "profiles.country",
          countryFilter.trim().toUpperCase(),
        );
      }

      if (dateFrom) {
        query = query.gte("created_at", dateStartIso(dateFrom));
      }

      if (dateTo) {
        query = query.lte("created_at", dateEndIso(dateTo));
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const pagedJobs = useMemo(() => {
    const allJobs = jobs ?? [];
    const start = (page - 1) * PAGE_SIZE;
    return allJobs.slice(start, start + PAGE_SIZE);
  }, [jobs, page]);

  const totalPages = Math.max(1, Math.ceil((jobs?.length ?? 0) / PAGE_SIZE));

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const selectedJob = useMemo(
    () => (jobs ?? []).find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ["admin", "job-details", selectedJobId],
    enabled: Boolean(selectedJobId),
    queryFn: async () => {
      if (!selectedJobId) return null;

      const { data: job, error: jobError } = await supabase
        .from("jobs")
        .select(
          "id, title, description, status, category, urgency, location, budget_min, budget_max, quotes_count, created_at, client_id",
        )
        .eq("id", selectedJobId)
        .maybeSingle();

      if (jobError) throw jobError;
      if (!job) return null;

      const [clientRes, quotesRes, bookingsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, email, phone, country")
          .eq("id", job.client_id)
          .maybeSingle(),
        supabase
          .from("quotes")
          .select(
            "id, provider_id, amount, estimated_duration, message, status, created_at",
          )
          .eq("job_id", selectedJobId)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select(
            "id, provider_id, client_id, amount, status, scheduled_date, created_at",
          )
          .eq("job_id", selectedJobId)
          .order("created_at", { ascending: false }),
      ]);

      const providerIds = [
        ...new Set([
          ...(quotesRes.data ?? []).map((quote) => quote.provider_id),
          ...(bookingsRes.data ?? []).map((booking) => booking.provider_id),
        ]),
      ];

      const { data: providerProfiles } = providerIds.length
        ? await supabase
            .from("profiles")
            .select("id, full_name, email")
            .in("id", providerIds)
        : {
            data: [] as {
              id: string;
              full_name: string | null;
              email: string;
            }[],
          };

      const providerMap = new Map(
        (providerProfiles ?? []).map((provider) => [provider.id, provider]),
      );

      const bookingIds = (bookingsRes.data ?? []).map((booking) => booking.id);
      const { data: escrowPayments } = bookingIds.length
        ? await supabase
            .from("escrow_payments")
            .select("id, booking_id, amount, platform_fee, status, created_at")
            .in("booking_id", bookingIds)
        : { data: [] as any[] };

      return {
        job,
        client: clientRes.data ?? null,
        quotes: (quotesRes.data ?? []).map((quote) => ({
          ...quote,
          provider_name:
            providerMap.get(quote.provider_id)?.full_name ?? "Provider",
          provider_email: providerMap.get(quote.provider_id)?.email ?? "—",
        })),
        bookings: (bookingsRes.data ?? []).map((booking) => ({
          ...booking,
          provider_name:
            providerMap.get(booking.provider_id)?.full_name ?? "Provider",
        })),
        payments: escrowPayments ?? [],
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Jobs</h1>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search jobs by title, description, category..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(
              value as
                | "all"
                | "draft"
                | "open"
                | "quoted"
                | "accepted"
                | "in_progress"
                | "completed"
                | "cancelled"
                | "disputed",
            );
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="quoted">Quoted</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="disputed">Disputed</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Country code (e.g. CA)"
          value={countryFilter}
          onChange={(event) => {
            setCountryFilter(event.target.value);
            setPage(1);
          }}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <div className="flex items-center gap-2">
          <div className="w-full">
            <Label className="mb-1 text-xs text-gray-500">From</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="w-full">
            <Label className="mb-1 text-xs text-gray-500">To</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 8 }).map((_, index) => (
                <Skeleton key={`job-row-${index}`} className="h-8 w-full" />
              ))}
            </div>
          ) : !jobs?.length ? (
            <p className="text-sm text-gray-500">No jobs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Category</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Budget</th>
                    <th className="pb-2">Quotes</th>
                    <th className="pb-2">Created</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedJobs.map((job) => (
                    <tr key={job.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{job.title}</td>
                      <td className="py-2 text-gray-600">{job.category}</td>
                      <td className="py-2">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${getJobStatusBadgeClass(job.status)}`}
                        >
                          {getJobStatusLabel(job.status)}
                        </span>
                      </td>
                      <td className="py-2 text-gray-600">
                        {formatBudget(job.budget_min, job.budget_max)}
                      </td>
                      <td className="py-2">{job.quotes_count ?? 0}</td>
                      <td className="py-2 text-gray-500">
                        {job.created_at
                          ? new Date(job.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="py-2">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant={
                              selectedJobId === job.id ? "default" : "outline"
                            }
                            onClick={() => openJobDetails(job.id)}
                          >
                            View Details
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-500">
          Showing {(jobs?.length ?? 0) === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, jobs?.length ?? 0)} of {jobs?.length ?? 0}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </Button>
          <span className="text-gray-600">
            Page {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <Sheet
        open={Boolean(selectedJobId)}
        onOpenChange={(open) => !open && closeJobDetails()}
      >
        <SheetContent
          side="right"
          className="w-full overflow-y-auto sm:max-w-xl p-0"
        >
          {/* Header section with solid background */}
          <SheetHeader className="bg-slate-50 border-b p-6 pb-4 pt-8">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  {details?.job?.title || selectedJob?.title || "Job Details"}
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-slate-500 font-medium pb-2">
                {details?.job?.category && (
                  <span className="flex items-center gap-1.5 min-w-0 text-slate-900 bg-slate-200 px-2 py-0.5 rounded-md text-xs">
                    {details.job.category}
                  </span>
                )}
                {details?.job?.status && (
                  <span
                    className={`flex items-center gap-1.5 min-w-0 px-2 py-0.5 rounded-md text-xs ${getJobStatusBadgeClass(details.job.status)}`}
                  >
                    {getJobStatusLabel(details.job.status)}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4" />
                  {formatBudget(
                    details?.job?.budget_min,
                    details?.job?.budget_max,
                  )}
                </span>
                {details?.job?.created_at && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Posted{" "}
                    {new Date(details.job.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                {details?.client && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-auto gap-2"
                    onClick={() =>
                      navigate(
                        `/dashboard/admin/users?userId=${details?.client?.id}`,
                      )
                    }
                  >
                    <ExternalLink className="w-4 h-4" /> View Client Profile
                  </Button>
                )}
              </div>
            </div>
          </SheetHeader>

          <div className="p-6">
            {detailsLoading ? (
              <div className="space-y-6">
                <Skeleton className="h-10 w-full rounded-lg" />
                <Skeleton className="h-32 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : !details ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <AlertCircle className="w-12 h-12 mb-3 text-slate-300" />
                <p>Job details unavailable</p>
              </div>
            ) : (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full flex h-auto bg-slate-100 p-1 mb-6 rounded-lg gap-1 overflow-x-auto flex-wrap sm:flex-nowrap">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 min-w-[70px] text-xs sm:text-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="quotes"
                    className="flex-1 min-w-[70px] text-xs sm:text-sm"
                  >
                    Quotes
                  </TabsTrigger>
                  <TabsTrigger
                    value="bookings"
                    className="flex-1 min-w-[70px] text-xs sm:text-sm"
                  >
                    Bookings
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {details.job.description && (
                    <div className="bg-slate-50 border rounded-xl p-4">
                      <h3 className="text-sm font-semibold text-slate-900 mb-2">
                        Description
                      </h3>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">
                        {details.job.description}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Job Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border rounded-xl p-4 flex flex-col gap-1">
                        <div className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                          <FileText className="w-4 h-4 text-purple-500" />{" "}
                          Quotes
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {details.quotes.length}
                        </div>
                      </div>

                      <div className="bg-slate-50 border rounded-xl p-4 flex flex-col gap-1">
                        <div className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                          <CalendarCheck className="w-4 h-4 text-emerald-500" />{" "}
                          Bookings
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {details.bookings.length}
                        </div>
                      </div>

                      <div className="bg-slate-50 border rounded-xl p-4 flex flex-col gap-1">
                        <div className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                          <CreditCard className="w-4 h-4 text-amber-500" />{" "}
                          Payments
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {details.payments.length}
                        </div>
                      </div>

                      <div className="bg-slate-50 border rounded-xl p-4 flex flex-col gap-1">
                        <div className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                          <CreditCard className="w-4 h-4 text-blue-500" /> Total
                          Paid
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          $
                          {details.payments
                            .reduce(
                              (sum: number, payment: any) =>
                                sum + Number(payment.amount ?? 0),
                              0,
                            )
                            .toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {details.client && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center justify-between">
                        Client Details
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            navigate(
                              `/dashboard/admin/users?userId=${details?.client?.id}`,
                            )
                          }
                        >
                          View Activity{" "}
                          <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </h3>
                      <div className="bg-white border rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between border-b pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                              <User className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">
                                {details.client.full_name ?? "Unknown Client"}
                              </p>
                              <p className="text-xs text-slate-500">
                                {details.client.id}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          {details.client.email && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail className="w-4 h-4 text-slate-400" />
                              <span className="truncate">
                                {details.client.email}
                              </span>
                            </div>
                          )}
                          {details.client.phone && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone className="w-4 h-4 text-slate-400" />
                              <span className="truncate">
                                {details.client.phone}
                              </span>
                            </div>
                          )}
                          {details.client.country && (
                            <div className="flex items-center gap-2 text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span className="truncate">
                                {details.client.country}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quotes">
                  {details.quotes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border rounded-xl border-dashed">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>No quotes for this job.</p>
                    </div>
                  ) : (
                    <div className="grid border rounded-lg overflow-hidden shrink-0 bg-white">
                      {details.quotes.map((quote: any, idx: number) => (
                        <div
                          key={quote.id}
                          className={`flex flex-col p-4 hover:bg-slate-50 group ${idx !== details.quotes.length - 1 ? "border-b" : ""}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex flex-col gap-0.5">
                              <p
                                className="font-semibold text-sm text-slate-900 cursor-pointer hover:underline"
                                onClick={() =>
                                  navigate(
                                    `/dashboard/admin/users?userId=${quote.provider_id}`,
                                  )
                                }
                              >
                                {quote.provider_name}{" "}
                                <ExternalLink className="w-3 h-3 inline text-slate-400" />
                              </p>
                              <p className="text-xs text-slate-500">
                                {quote.provider_email}
                              </p>
                            </div>
                            <div className="text-right flex flex-col gap-1 items-end">
                              <span className="font-medium text-slate-900">
                                ${Number(quote.amount ?? 0).toFixed(2)}
                              </span>
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                  quote.status === "accepted"
                                    ? "bg-green-100 text-green-700"
                                    : quote.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {quote.status}
                              </span>
                            </div>
                          </div>
                          {quote.message && (
                            <p className="text-sm text-slate-600 bg-slate-50 p-2 rounded italic">
                              &ldquo;{quote.message}&rdquo;
                            </p>
                          )}
                          {quote.estimated_duration && (
                            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Est. duration:{" "}
                              {quote.estimated_duration}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="bookings">
                  {details.bookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border rounded-xl border-dashed">
                      <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>No bookings for this job.</p>
                    </div>
                  ) : (
                    <div className="grid border rounded-lg overflow-hidden shrink-0 bg-white">
                      {details.bookings.map((booking: any, idx: number) => (
                        <div
                          key={booking.id}
                          className={`flex items-center justify-between p-4 hover:bg-slate-50 group ${idx !== details.bookings.length - 1 ? "border-b" : ""}`}
                        >
                          <div className="flex flex-col gap-1">
                            <p
                              className="font-semibold text-sm text-slate-900 cursor-pointer hover:underline"
                              onClick={() =>
                                navigate(
                                  `/dashboard/admin/users?userId=${booking.provider_id}`,
                                )
                              }
                            >
                              {booking.provider_name}{" "}
                              <ExternalLink className="w-3 h-3 inline text-slate-400" />
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1.5">
                              <CalendarCheck className="w-3.5 h-3.5" />{" "}
                              Scheduled:{" "}
                              {booking.scheduled_date
                                ? new Date(
                                    booking.scheduled_date,
                                  ).toLocaleDateString()
                                : "—"}
                            </p>
                          </div>
                          <div className="text-right flex flex-col gap-1 items-end">
                            <span className="font-medium text-slate-900">
                              ${Number(booking.amount ?? 0).toFixed(2)}
                            </span>
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                                booking.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : booking.status === "cancelled"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
