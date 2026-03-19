import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "@/lib/router";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Skeleton } from "../../../ui/skeleton";
import { Users, Briefcase, DollarSign, Shield } from "lucide-react";

function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [usersRes, jobsRes, bookingsRes, pendingVerRes, disputesRes] =
        await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("jobs").select("*", { count: "exact", head: true }),
          supabase.from("bookings").select("*", { count: "exact", head: true }),
          supabase
            .from("user_role_memberships")
            .select("*", { count: "exact", head: true })
            .eq("role", "provider")
            .eq("state", "pending_review"),
          supabase
            .from("reports")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        ]);

      return {
        totalUsers: usersRes.count ?? 0,
        totalJobs: jobsRes.count ?? 0,
        totalBookings: bookingsRes.count ?? 0,
        pendingVerifications: pendingVerRes.count ?? 0,
        openDisputes: disputesRes.count ?? 0,
      };
    },
  });
}

function useRecentBookings() {
  return useQuery({
    queryKey: ["admin", "recent-bookings"],
    queryFn: async () => {
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select(
          "id, job_id, status, amount, created_at, client_id, provider_id",
        )
        .order("created_at", { ascending: false })
        .limit(10);

      if (bookingsError) {
        throw bookingsError;
      }

      const rows = bookings ?? [];
      if (rows.length === 0) {
        return [];
      }

      const profileIds = [
        ...new Set(rows.flatMap((row) => [row.client_id, row.provider_id])),
      ];

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", profileIds);

      if (profilesError) {
        return rows.map((row) => ({
          ...row,
          client_name: "—",
          provider_name: "—",
        }));
      }

      const profileMap = new Map(
        (profiles ?? []).map((profile) => [profile.id, profile.full_name]),
      );

      return rows.map((row) => ({
        ...row,
        client_name: profileMap.get(row.client_id) ?? "—",
        provider_name: profileMap.get(row.provider_id) ?? "—",
      }));
    },
  });
}

export function AdminOverview() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const {
    data: recentBookings,
    isLoading: recentBookingsLoading,
    error: recentBookingsError,
  } = useRecentBookings();

  const cards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "text-blue-600",
    },
    {
      label: "Total Jobs",
      value: stats?.totalJobs ?? 0,
      icon: Briefcase,
      color: "text-green-600",
    },
    {
      label: "Total Bookings",
      value: stats?.totalBookings ?? 0,
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      label: "Pending Verifications",
      value: stats?.pendingVerifications ?? 0,
      icon: Shield,
      color: "text-amber-600",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {c.label}
              </CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold">{c.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {recentBookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`recent-booking-skeleton-${index}`}
                  className="grid grid-cols-5 gap-4"
                >
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
              ))}
            </div>
          ) : recentBookingsError ? (
            <p className="text-red-600 text-sm">
              Failed to load recent bookings.
            </p>
          ) : !recentBookings?.length ? (
            <p className="text-gray-500 text-sm">No bookings yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Client</th>
                    <th className="pb-2">Provider</th>
                    <th className="pb-2">Amount</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Date</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2">{b.client_name ?? "—"}</td>
                      <td className="py-2">{b.provider_name ?? "—"}</td>
                      <td className="py-2">
                        ${Number(b.amount ?? 0).toFixed(2)}
                      </td>
                      <td className="py-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 capitalize">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-2">
                        <div className="flex justify-end">
                          {b.job_id ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                navigate(
                                  `/dashboard/admin/jobs?jobId=${b.job_id}`,
                                )
                              }
                            >
                              Open Job
                            </Button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
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
    </div>
  );
}
