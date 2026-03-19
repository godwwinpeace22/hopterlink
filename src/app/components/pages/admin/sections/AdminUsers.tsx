import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
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
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  FileText,
  CalendarCheck,
  CreditCard,
  ShieldAlert,
  UserX,
  UserCheck,
  ChevronRight,
  Star,
} from "lucide-react";
import { useNavigate, useSearchParams } from "@/lib/router";
import { Skeleton } from "../../../ui/skeleton";
import { Sheet, SheetContent, SheetHeader } from "../../../ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";

type SelectedUserDetails = {
  profile: any;
  jobs: any[];
  quotes: any[];
  bookings: any[];
  payments: any[];
  reviews: any[];
};

const PAGE_SIZE = 20;

function dateStartIso(date: string) {
  return `${date}T00:00:00.000Z`;
}

function dateEndIso(date: string) {
  return `${date}T23:59:59.999Z`;
}

export function AdminUsers() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");
  const [countryFilter, setCountryFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const selectedUserId = searchParams.get("userId");

  const setQueryParam = (key: string, value?: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next);
  };

  const openUserDetails = (userId: string) => setQueryParam("userId", userId);
  const closeUserDetails = () => setQueryParam("userId", null);

  const { data: users, isLoading } = useQuery({
    queryKey: [
      "admin",
      "users",
      search,
      statusFilter,
      countryFilter,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(
          "id, full_name, email, role, avatar_url, country, created_at, phone_verified, is_active, is_suspended",
        )
        .order("created_at", { ascending: false })
        .limit(500);

      if (search.trim()) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (statusFilter === "active") {
        query = query.eq("is_suspended", false);
      } else if (statusFilter === "suspended") {
        query = query.eq("is_suspended", true);
      }

      if (countryFilter.trim()) {
        query = query.eq("country", countryFilter.trim().toUpperCase());
      }

      if (dateFrom) {
        query = query.gte("created_at", dateStartIso(dateFrom));
      }

      if (dateTo) {
        query = query.lte("created_at", dateEndIso(dateTo));
      }

      const { data } = await query;
      return data ?? [];
    },
  });

  const pagedUsers = useMemo(() => {
    const allUsers = users ?? [];
    const start = (page - 1) * PAGE_SIZE;
    return allUsers.slice(start, start + PAGE_SIZE);
  }, [users, page]);

  const totalPages = Math.max(1, Math.ceil((users?.length ?? 0) / PAGE_SIZE));

  const goToPage = (nextPage: number) => {
    setPage(Math.min(totalPages, Math.max(1, nextPage)));
  };

  const selectedUser = useMemo(
    () => (users ?? []).find((user: any) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const { data: details, isLoading: detailsLoading } = useQuery({
    queryKey: ["admin", "user-details", selectedUserId],
    enabled: Boolean(selectedUserId),
    queryFn: async (): Promise<SelectedUserDetails | null> => {
      if (!selectedUserId) return null;

      const [profileRes, jobsRes, quotesRes, bookingsRes, reviewsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, full_name, email, role, phone, country, created_at, phone_verified, is_active, is_suspended",
            )
            .eq("id", selectedUserId)
            .maybeSingle(),
          supabase
            .from("jobs")
            .select(
              "id, title, status, category, budget_min, budget_max, created_at",
            )
            .eq("client_id", selectedUserId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("quotes")
            .select("id, job_id, amount, status, created_at")
            .eq("provider_id", selectedUserId)
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("bookings")
            .select(
              "id, job_id, status, amount, scheduled_date, created_at, client_id, provider_id",
            )
            .or(
              `client_id.eq.${selectedUserId},provider_id.eq.${selectedUserId}`,
            )
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("reviews")
            .select("id, rating, comment, created_at, reviewer_id")
            .eq("reviewee_id", selectedUserId)
            .order("created_at", { ascending: false })
            .limit(50),
        ]);

      const bookingIds = (bookingsRes.data ?? []).map((booking) => booking.id);
      let payments: any[] = [];

      if (bookingIds.length > 0) {
        const { data: paymentsData } = await supabase
          .from("escrow_payments")
          .select("id, booking_id, amount, platform_fee, status, created_at")
          .in("booking_id", bookingIds)
          .order("created_at", { ascending: false })
          .limit(50);
        payments = paymentsData ?? [];
      }

      return {
        profile: profileRes.data ?? null,
        jobs: jobsRes.data ?? [],
        quotes: quotesRes.data ?? [],
        bookings: bookingsRes.data ?? [],
        payments,
        reviews: reviewsRes.data ?? [],
      };
    },
  });

  const toggleSuspensionMutation = useMutation({
    mutationFn: async (args: { userId: string; suspend: boolean }) => {
      const { error } = await supabase
        .from("profiles")
        .update({ is_suspended: args.suspend })
        .eq("id", args.userId);

      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "users"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "user-details"] }),
      ]);
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <div className="grid gap-4 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "active" | "suspended") => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
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
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-gray-500 text-sm">Loading users...</p>
          ) : !users?.length ? (
            <p className="text-gray-500 text-sm">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Country</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Verified</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Joined</th>
                    <th className="pb-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u: any) => (
                    <tr key={u.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{u.full_name ?? "—"}</td>
                      <td className="py-2 text-gray-600">{u.email ?? "—"}</td>
                      <td className="py-2 text-gray-600">{u.country ?? "—"}</td>
                      <td className="py-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 capitalize">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2">
                        {u.phone_verified ? (
                          <span className="text-green-600 text-xs font-medium">
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">No</span>
                        )}
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            u.is_suspended
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {u.is_suspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant={
                              selectedUserId === u.id ? "default" : "outline"
                            }
                            onClick={() => openUserDetails(u.id)}
                          >
                            Details
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
          Showing {(users?.length ?? 0) === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
          {Math.min(page * PAGE_SIZE, users?.length ?? 0)} of{" "}
          {users?.length ?? 0}
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
        open={Boolean(selectedUserId)}
        onOpenChange={(open) => !open && closeUserDetails()}
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
                  {details?.profile?.full_name ||
                    selectedUser?.full_name ||
                    "Unknown User"}
                  {details?.profile?.is_suspended && (
                    <span className="bg-red-100 text-red-700 text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                      <ShieldAlert className="w-3 h-3" /> Suspended
                    </span>
                  )}
                </CardTitle>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1 text-sm text-slate-500 font-medium pb-2">
                <span className="flex items-center gap-1.5 min-w-0">
                  <Mail className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    {details?.profile?.email || selectedUser?.email}
                  </span>
                </span>
                {details?.profile?.country && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    {details.profile.country}
                  </span>
                )}
                {details?.profile?.created_at && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined{" "}
                    {new Date(details.profile.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  size="sm"
                  variant={
                    details?.profile?.is_suspended ? "outline" : "destructive"
                  }
                  className="w-auto gap-2"
                  disabled={toggleSuspensionMutation.isPending}
                  onClick={() =>
                    selectedUserId &&
                    toggleSuspensionMutation.mutate({
                      userId: selectedUserId,
                      suspend: !details?.profile?.is_suspended,
                    })
                  }
                >
                  {details?.profile?.is_suspended ? (
                    <>
                      <UserCheck className="w-4 h-4" /> Unsuspend User
                    </>
                  ) : (
                    <>
                      <UserX className="w-4 h-4" /> Suspend User
                    </>
                  )}
                </Button>
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
            ) : details ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full flex h-auto bg-slate-100 p-1 mb-6 rounded-lg gap-1 overflow-x-auto flex-wrap sm:flex-nowrap">
                  <TabsTrigger
                    value="overview"
                    className="flex-1 min-w-[70px] text-xs sm:text-sm"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="jobs"
                    className="flex-1 min-w-[70px] text-xs sm:text-sm"
                  >
                    Jobs
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
                  <TabsTrigger
                    value="reviews"
                    className="flex-1 min-w-[70px] text-xs sm:text-sm"
                  >
                    Reviews
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Overview Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 border rounded-xl p-4 flex flex-col gap-1">
                        <div className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                          <Briefcase className="w-4 h-4 text-blue-500" /> Jobs
                          Posted
                        </div>
                        <div className="text-2xl font-bold text-slate-900">
                          {details.jobs.length}
                        </div>
                      </div>

                      <div className="bg-slate-50 border rounded-xl p-4 flex flex-col gap-1">
                        <div className="text-slate-500 text-sm flex items-center gap-2 font-medium">
                          <FileText className="w-4 h-4 text-purple-500" />{" "}
                          Quotes Sent
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
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="jobs">
                  {details.jobs.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border rounded-xl border-dashed">
                      <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>No jobs found.</p>
                    </div>
                  ) : (
                    <div className="grid border rounded-lg overflow-hidden shrink-0 bg-white">
                      {details.jobs.map((job, idx) => (
                        <div
                          key={job.id}
                          className={`flex items-center justify-between p-3 px-4 hover:bg-slate-50 group cursor-pointer ${idx !== details.jobs.length - 1 ? "border-b" : ""}`}
                          onClick={() =>
                            navigate(`/dashboard/admin/jobs?jobId=${job.id}`)
                          }
                        >
                          <div className="flex flex-col gap-1 pr-4 truncate min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              {job.title}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="capitalize">{job.status}</span>
                              <span>&bull;</span>
                              <span className="truncate">{job.category}</span>
                              <span>&bull;</span>
                              <span className="truncate">
                                {new Date(job.created_at).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="quotes">
                  {details.quotes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border rounded-xl border-dashed">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>No quotes found.</p>
                    </div>
                  ) : (
                    <div className="grid border rounded-lg overflow-hidden shrink-0 bg-white">
                      {details.quotes.map((quote, idx) => (
                        <div
                          key={quote.id}
                          className={`flex items-center justify-between p-3 px-4 hover:bg-slate-50 group cursor-pointer ${idx !== details.quotes.length - 1 ? "border-b" : ""}`}
                          onClick={() =>
                            navigate(
                              `/dashboard/admin/jobs?jobId=${quote.job_id}`,
                            )
                          }
                        >
                          <div className="flex flex-col gap-1 pr-4 truncate min-w-0">
                            <p className="font-semibold text-sm text-slate-900 truncate">
                              Quote for Job {quote.job_id.substring(0, 8)}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="capitalize font-medium text-slate-700">
                                ${Number(quote.amount ?? 0).toFixed(2)}
                              </span>
                              <span>&bull;</span>
                              <span className="capitalize">{quote.status}</span>
                              <span>&bull;</span>
                              <span className="truncate">
                                {new Date(
                                  quote.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="bookings">
                  {details.bookings.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border rounded-xl border-dashed">
                      <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>No bookings found.</p>
                    </div>
                  ) : (
                    <div className="grid border rounded-lg overflow-hidden shrink-0 bg-white">
                      {details.bookings.map((booking, idx) => (
                        <div
                          key={booking.id}
                          className={`flex items-center justify-between p-3 px-4 hover:bg-slate-50 group cursor-pointer ${idx !== details.bookings.length - 1 ? "border-b" : ""}`}
                          onClick={() =>
                            booking.job_id &&
                            navigate(
                              `/dashboard/admin/jobs?jobId=${booking.job_id}`,
                            )
                          }
                        >
                          <div className="flex flex-col gap-1 pr-4 truncate min-w-0">
                            <p className="font-semibold text-sm text-slate-900">
                              Booking #{booking.id.substring(0, 8)}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                              <span className="font-medium text-slate-700">
                                ${Number(booking.amount ?? 0).toFixed(2)}
                              </span>
                              <span>&bull;</span>
                              <span className="capitalize">
                                {booking.status}
                              </span>
                              <span>&bull;</span>
                              <span className="truncate">
                                {new Date(
                                  booking.created_at,
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 shrink-0 transition-colors" />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="reviews">
                  {details.reviews.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border rounded-xl border-dashed">
                      <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p>No reviews found.</p>
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {details.reviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-slate-50 border rounded-xl p-4 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"}`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment ? (
                            <p className="text-sm text-slate-700 italic">
                              "{review.comment}"
                            </p>
                          ) : (
                            <p className="text-sm text-slate-400 italic">
                              No comment provided.
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <UserX className="w-12 h-12 mb-3 text-slate-300" />
                <p>User details unavailable</p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
