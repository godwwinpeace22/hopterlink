import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
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
      const { data } = await supabase
        .from("bookings")
        .select(
          "id, status, total_amount, created_at, client:profiles!bookings_client_id_fkey(full_name), provider:profiles!bookings_provider_id_fkey(full_name)",
        )
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });
}

export function AdminOverview() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: recentBookings } = useRecentBookings();

  if (isLoading) {
    return <div className="text-gray-500">Loading dashboard...</div>;
  }

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
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          {!recentBookings?.length ? (
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
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((b: any) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2">{b.client?.full_name ?? "—"}</td>
                      <td className="py-2">{b.provider?.full_name ?? "—"}</td>
                      <td className="py-2">
                        ${Number(b.total_amount ?? 0).toFixed(2)}
                      </td>
                      <td className="py-2">
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 capitalize">
                          {b.status}
                        </span>
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(b.created_at).toLocaleDateString()}
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
