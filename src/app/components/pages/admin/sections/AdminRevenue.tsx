import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import {
  DollarSign,
  Activity,
  Lock,
  Unlock,
  TrendingUp,
  Calendar,
  ArrowRightLeft,
} from "lucide-react";
import { useState } from "react";

type CurrencyTotals = {
  total: number;
  fees: number;
  held: number;
  released: number;
};

type MonthlyRow = {
  month: string;
  currency: string;
  volume: number;
  fees: number;
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount);
}

export function AdminRevenue() {
  const [activeCurrency, setActiveCurrency] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const { data: byCurrency, isLoading } = useQuery({
    queryKey: ["admin", "revenue", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("escrow_payments")
        .select(
          "amount, platform_fee, status, client:profiles!client_id(currency)",
        );

      if (startDate) {
        query = query.gte("created_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        const endDay = new Date(endDate);
        endDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDay.toISOString());
      }

      const { data: escrows, error } = await query;

      if (error) throw error;
      if (!escrows) return {} as Record<string, CurrencyTotals>;

      const acc: Record<string, CurrencyTotals> = {};
      for (const e of escrows) {
        const currency = (
          (e.client as { currency?: string | null } | null)?.currency ?? "USD"
        ).toUpperCase();
        if (!acc[currency])
          acc[currency] = { total: 0, fees: 0, held: 0, released: 0 };
        const amount = Number(e.amount ?? 0);
        acc[currency].total += amount;
        acc[currency].fees += Number(e.platform_fee ?? 0);
        if (e.status === "held") acc[currency].held += amount;
        if (e.status === "released") acc[currency].released += amount;
      }
      return acc;
    },
  });

  const { data: monthlyData } = useQuery({
    queryKey: ["admin", "monthly-revenue", startDate, endDate],
    queryFn: async () => {
      let query = supabase
        .from("escrow_payments")
        .select(
          "amount, platform_fee, created_at, client:profiles!client_id(currency)",
        );

      if (startDate) {
        query = query.gte("created_at", new Date(startDate).toISOString());
      }
      if (endDate) {
        const endDay = new Date(endDate);
        endDay.setHours(23, 59, 59, 999);
        query = query.lte("created_at", endDay.toISOString());
      }

      const { data: escrows, error } = await query;

      if (error) throw error;
      if (!escrows) return [] as MonthlyRow[];

      const key = (month: string, currency: string) => `${month}__${currency}`;
      const byMonthCurrency: Record<
        string,
        { month: string; currency: string; volume: number; fees: number }
      > = {};

      for (const e of escrows) {
        const currency = (
          (e.client as { currency?: string | null } | null)?.currency ?? "USD"
        ).toUpperCase();
        const month = new Date(e.created_at!).toLocaleDateString("en-CA", {
          year: "numeric",
          month: "short",
        });
        const k = key(month, currency);
        if (!byMonthCurrency[k])
          byMonthCurrency[k] = { month, currency, volume: 0, fees: 0 };
        byMonthCurrency[k].volume += Number(e.amount ?? 0);
        byMonthCurrency[k].fees += Number(e.platform_fee ?? 0);
      }

      return Object.values(byMonthCurrency).sort((a, b) =>
        a.month !== b.month
          ? a.month.localeCompare(b.month)
          : a.currency.localeCompare(b.currency),
      ) as MonthlyRow[];
    },
  });

  const currencies = Object.keys(byCurrency ?? {}).sort();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          Revenue Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor platform volume, fees, and escrow status across all
          currencies.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-8 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex gap-2">
              <div className="h-9 w-20 bg-gray-200 rounded-full"></div>
              <div className="h-9 w-20 bg-gray-200 rounded-full"></div>
            </div>
            <div className="h-9 w-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 bg-gray-100 rounded-xl border border-gray-200"
                ></div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          {currencies.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <ArrowRightLeft className="w-10 h-10 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No revenue data yet
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Escrow and revenue processing will appear here.
              </p>
            </div>
          )}

          {currencies.length > 0 && (
            <div className="space-y-6 mb-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  {currencies.map((currency) => {
                    const isActive =
                      (activeCurrency || currencies[0]) === currency;
                    return (
                      <button
                        key={currency}
                        onClick={() => setActiveCurrency(currency)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                          isActive
                            ? "bg-gray-900 text-white shadow-md"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {currency}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                    />
                    <span className="text-gray-400 text-sm">to</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="bg-transparent text-sm font-medium text-gray-700 outline-none cursor-pointer"
                    />
                    {(startDate || endDate) && (
                      <button
                        onClick={() => {
                          setStartDate("");
                          setEndDate("");
                        }}
                        className="ml-1 px-2 py-0.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 rounded"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {(() => {
                const currentCurrency = activeCurrency || currencies[0];
                const d = byCurrency![currentCurrency];
                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <h2 className="text-lg font-bold text-gray-900 tracking-wide">
                        {currentCurrency} Detailed Overview
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">
                            Total {currentCurrency} Volume
                          </CardTitle>
                          <Activity className="h-4 w-4 text-gray-400" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold tracking-tight text-gray-900">
                            {fmt(d.total, currentCurrency)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm hover:shadow-md transition-shadow bg-green-50/30">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-green-700">
                            Platform Fees (10%)
                          </CardTitle>
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-700">
                            {fmt(d.fees, currentCurrency)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">
                            Held in Escrow
                          </CardTitle>
                          <Lock className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-amber-600">
                            {fmt(d.held, currentCurrency)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                          <CardTitle className="text-sm font-medium text-gray-500">
                            Released
                          </CardTitle>
                          <Unlock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">
                            {fmt(d.released, currentCurrency)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <Card className="border shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-gray-50/50 flex flex-row items-center gap-2 py-4">
              <Calendar className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-lg">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!monthlyData?.length ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No monthly breakdown data available yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/50 text-gray-600 font-medium">
                      <tr>
                        <th className="px-6 py-4 border-b">Month</th>
                        <th className="px-6 py-4 border-b">Currency</th>
                        <th className="px-6 py-4 border-b text-right">
                          Volume
                        </th>
                        <th className="px-6 py-4 border-b text-right">
                          Platform Fees
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {monthlyData.map((row) => (
                        <tr
                          key={`${row.month}-${row.currency}`}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {row.month}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                              {row.currency}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums font-medium text-gray-900">
                            {fmt(row.volume, row.currency)}
                          </td>
                          <td className="px-6 py-4 text-right tabular-nums text-green-600 font-semibold">
                            {fmt(row.fees, row.currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
