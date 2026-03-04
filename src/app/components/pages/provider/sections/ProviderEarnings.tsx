import { useEffect, useMemo, useState } from "react";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

type EarningsTransaction = {
  id: string;
  service: string;
  client: string;
  date: string;
  createdAt: string | null;
  status: "pending" | "held" | "released" | "refunded" | "disputed";
  amount: number;
};

export const ProviderEarnings = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<EarningsTransaction[]>([]);
  const [summary, setSummary] = useState({
    total: 0,
    thisMonth: 0,
    pending: 0,
  });

  useEffect(() => {
    if (!user?.id) return;

    const fetchEarnings = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from("escrow_payments")
        .select(
          `
          id,
          amount,
          provider_amount,
          status,
          created_at,
          booking:bookings (
            service_type
          ),
          client:profiles!escrow_payments_client_id_fkey (
            full_name
          )
        `,
        )
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      const mapped = (data ?? []).map((payment) => {
        const createdAtDate = payment.created_at
          ? new Date(payment.created_at)
          : null;
        const formattedDate = createdAtDate
          ? createdAtDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "";

        const status =
          payment.status ?? ("pending" as EarningsTransaction["status"]);

        return {
          id: payment.id,
          service: payment.booking?.service_type ?? "Service",
          client: payment.client?.full_name ?? "Client",
          date: formattedDate,
          createdAt: payment.created_at ?? null,
          status,
          amount: Number(payment.provider_amount ?? payment.amount ?? 0),
        } satisfies EarningsTransaction;
      });

      const totalReleased = mapped
        .filter((entry) => entry.status === "released")
        .reduce((sum, entry) => sum + entry.amount, 0);
      const pendingTotal = mapped
        .filter(
          (entry) => entry.status === "pending" || entry.status === "held",
        )
        .reduce((sum, entry) => sum + entry.amount, 0);
      const monthReleased = mapped
        .filter(
          (entry) =>
            entry.status === "released" &&
            entry.createdAt &&
            new Date(entry.createdAt).getTime() >= monthStart.getTime(),
        )
        .reduce((sum, entry) => sum + entry.amount, 0);

      setTransactions(mapped);
      setSummary({
        total: totalReleased,
        thisMonth: monthReleased,
        pending: pendingTotal,
      });
      setIsLoading(false);
    };

    fetchEarnings();
  }, [user?.id]);

  const earningsTrend = useMemo(() => {
    if (summary.total <= 0) return 0;
    return summary.thisMonth > 0
      ? Math.round((summary.thisMonth / summary.total) * 100)
      : 0;
  }, [summary.thisMonth, summary.total]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border border-[#F7C876]/40 bg-[#FFF7E8]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-[#7C5A1E]">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-[#2B2B2B]">
                ${summary.total.toLocaleString()}
              </p>
              <p className="text-xs text-[#7C5A1E] mt-1">All time</p>
            </CardContent>
          </Card>

          <Card className="border border-[#F7C876]/40 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900">
                ${summary.thisMonth.toLocaleString()}
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="h-4 w-4" />
                {earningsTrend}% of total earnings
              </p>
            </CardContent>
          </Card>

          <Card className="border border-[#F7C876]/40 bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Payout
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold text-gray-900">
                ${summary.pending.toLocaleString()}
              </p>
              <Button
                size="sm"
                className="mt-3 bg-[#F7C876] text-[#2B2B2B] hover:bg-[#EFA055]"
                disabled={summary.pending <= 0}
              >
                Request payout
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card className="border border-gray-200/80">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Wallet className="h-4 w-4" />
              {transactions.length} transactions
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-16 rounded-lg bg-gray-100 animate-pulse"
                  />
                ))}
              </div>
            ) : errorMessage ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500">
                No earnings yet. Completed jobs will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-gray-200/80 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          transaction.status === "released"
                            ? "bg-green-100"
                            : transaction.status === "refunded"
                              ? "bg-red-100"
                              : "bg-orange-100"
                        }`}
                      >
                        <DollarSign
                          className={`h-5 w-5 ${
                            transaction.status === "released"
                              ? "text-green-600"
                              : transaction.status === "refunded"
                                ? "text-red-600"
                                : "text-orange-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {transaction.service}
                        </p>
                        <p className="text-sm text-gray-600">
                          {transaction.client} • {transaction.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg text-gray-900">
                        ${transaction.amount.toLocaleString()}
                      </p>
                      <Badge
                        className={
                          transaction.status === "released"
                            ? "bg-green-600"
                            : transaction.status === "refunded"
                              ? "bg-red-500"
                              : "bg-orange-500"
                        }
                      >
                        {transaction.status === "released"
                          ? "Paid"
                          : transaction.status === "held"
                            ? "Held"
                            : transaction.status === "refunded"
                              ? "Refunded"
                              : transaction.status === "disputed"
                                ? "Disputed"
                                : "Pending"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
