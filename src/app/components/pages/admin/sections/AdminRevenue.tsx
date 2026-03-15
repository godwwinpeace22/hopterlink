import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";

export function AdminRevenue() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "revenue"],
    queryFn: async () => {
      const { data: escrows } = await supabase
        .from("escrow_payments")
        .select("amount, platform_fee, status, created_at");

      if (!escrows) return { total: 0, fees: 0, held: 0, released: 0 };

      const total = escrows.reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
      const fees = escrows.reduce(
        (sum, e) => sum + Number(e.platform_fee ?? 0),
        0,
      );
      const held = escrows
        .filter((e) => e.status === "held")
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);
      const released = escrows
        .filter((e) => e.status === "released")
        .reduce((sum, e) => sum + Number(e.amount ?? 0), 0);

      return { total, fees, held, released };
    },
  });

  const { data: monthlyData } = useQuery({
    queryKey: ["admin", "monthly-revenue"],
    queryFn: async () => {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: escrows } = await supabase
        .from("escrow_payments")
        .select("amount, platform_fee, created_at")
        .gte("created_at", sixMonthsAgo.toISOString());

      if (!escrows) return [];

      const byMonth: Record<string, { volume: number; fees: number }> = {};
      for (const e of escrows) {
        const month = new Date(e.created_at!).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
        });
        if (!byMonth[month]) byMonth[month] = { volume: 0, fees: 0 };
        byMonth[month].volume += Number(e.amount ?? 0);
        byMonth[month].fees += Number(e.platform_fee ?? 0);
      }

      return Object.entries(byMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, vals]) => ({ month, ...vals }));
    },
  });

  if (isLoading) {
    return <div className="text-gray-500">Loading revenue data...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Revenue</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data?.total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Platform Fees (10%)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data?.fees.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Held in Escrow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${data?.held.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Released
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${data?.released.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {!monthlyData?.length ? (
            <p className="text-gray-500 text-sm">No revenue data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2">Month</th>
                    <th className="pb-2 text-right">Volume</th>
                    <th className="pb-2 text-right">Platform Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row) => (
                    <tr key={row.month} className="border-b last:border-0">
                      <td className="py-2">{row.month}</td>
                      <td className="py-2 text-right">
                        ${row.volume.toFixed(2)}
                      </td>
                      <td className="py-2 text-right text-green-600">
                        ${row.fees.toFixed(2)}
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
