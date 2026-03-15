import { useEffect, useMemo, useState } from "react";
import { ArrowDownLeft, ArrowUpRight, Plus, Wallet } from "lucide-react";
import { useLocation, useNavigate } from "@/lib/router";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { WALLET_CONFIG } from "@/app/config/walletConfig";
import { useWalletTopups } from "@/app/hooks/useWalletTopups";
import { useCreateWalletTopupCheckout } from "@/app/hooks/useCreateWalletTopupCheckout";
import { Button } from "../../../ui/button";
import { Badge } from "../../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";

type ClientEscrowPayment = {
  id: string;
  amount: number;
  status: string;
  created_at: string | null;
  metadata: { payment_kind?: string; note?: string | null } | null;
  booking: { service_type: string | null } | null;
  provider: { full_name: string | null } | null;
};

type ClientWalletTransaction = {
  id: string;
  type: "topup" | "payment";
  amount: number;
  status: string;
  description: string;
  createdAt: string;
};

const statusClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  held: "bg-amber-100 text-amber-700",
  succeeded: "bg-emerald-100 text-emerald-700",
  released: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  canceled: "bg-slate-100 text-slate-700",
  refunded: "bg-slate-100 text-slate-700",
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: WALLET_CONFIG.currency,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateInput: string | null) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-CA", {
    timeZone: WALLET_CONFIG.timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const ClientWallet = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [topupDialogOpen, setTopupDialogOpen] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");

  const paymentsQuery = useSupabaseQuery(
    ["client_wallet_payments", user?.id],
    () =>
      supabase
        .from("escrow_payments")
        .select(
          `
            id,
            amount,
            status,
            created_at,
            metadata,
            booking:bookings (
              service_type
            ),
            provider:profiles!escrow_payments_provider_id_fkey (
              full_name
            )
          `,
        )
        .eq("client_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  const balanceQuery = useSupabaseQuery(
    ["client_wallet_balance", user?.id],
    () =>
      supabase.rpc("compute_wallet_balance", {
        p_user_id: user?.id ?? "",
      }),
    { enabled: Boolean(user?.id) },
  );

  const {
    topups,
    isLoading: isTopupsLoading,
    errorMessage: topupsErrorMessage,
    refresh: refreshTopups,
  } = useWalletTopups(user?.id);

  const createTopupCheckoutMutation = useCreateWalletTopupCheckout();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const topupResult = params.get("topup");

    if (!topupResult) {
      return;
    }

    if (topupResult === "success") {
      toast.success("Payment received. Wallet balance will update shortly.");
      refreshTopups();
    }

    if (topupResult === "cancel") {
      toast.message("Top-up was canceled.");
    }

    params.delete("topup");
    params.delete("session_id");

    const search = params.toString();
    const newUrl = search
      ? `${location.pathname}?${search}`
      : location.pathname;

    navigate(newUrl, { replace: true });
  }, [location.pathname, location.search, navigate, refreshTopups]);

  const isLoading =
    paymentsQuery.isLoading || isTopupsLoading || balanceQuery.isLoading;
  const errorMessage =
    paymentsQuery.data?.error?.message ??
    balanceQuery.data?.error?.message ??
    topupsErrorMessage ??
    null;

  const payments = useMemo<ClientEscrowPayment[]>(() => {
    const data = paymentsQuery.data?.data ?? [];

    return data.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount ?? 0),
      status: payment.status ?? "pending",
      created_at: payment.created_at,
      metadata: payment.metadata,
      booking: payment.booking,
      provider: payment.provider,
    }));
  }, [paymentsQuery.data?.data]);

  const availableBalance = Math.max(Number(balanceQuery.data?.data ?? 0), 0);

  const topupBalance = useMemo(
    () =>
      topups.reduce((sum, topup) => {
        if (topup.status !== "succeeded") {
          return sum;
        }

        return sum + topup.amount_cents / 100;
      }, 0),
    [topups],
  );

  const walletSpend = useMemo(
    () =>
      payments.reduce((sum, payment) => {
        if (payment.status === "failed" || payment.status === "canceled") {
          return sum;
        }

        return sum + Math.abs(payment.amount);
      }, 0),
    [payments],
  );

  const transactions = useMemo<ClientWalletTransaction[]>(() => {
    const topupTransactions: ClientWalletTransaction[] = topups.map(
      (topup) => ({
        id: `topup-${topup.id}`,
        type: "topup",
        amount: topup.amount_cents / 100,
        status: topup.status,
        description: "Stripe top-up",
        createdAt: topup.created_at,
      }),
    );

    const spends: ClientWalletTransaction[] = payments.map((payment) => ({
      id: `payment-${payment.id}`,
      type: "payment",
      amount: -Math.abs(payment.amount),
      status: payment.status,
      description:
        payment.metadata?.payment_kind === "booking_bonus"
          ? `Booking Bonus • ${payment.booking?.service_type ?? "Service"} • ${payment.provider?.full_name ?? "Provider"}`
          : `${payment.booking?.service_type ?? "Service"} • ${payment.provider?.full_name ?? "Provider"}`,
      createdAt: payment.created_at ?? new Date().toISOString(),
    }));

    return [...topupTransactions, ...spends].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
  }, [payments, topups]);

  const handleTopupRequest = async () => {
    if (!user?.id) {
      toast.error("User not found.");
      return;
    }

    const amount = Number(topupAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid top-up amount.");
      return;
    }

    const amountCents = Math.round(amount * 100);

    if (amountCents <= 0) {
      toast.error("Enter a valid top-up amount.");
      return;
    }

    try {
      const checkout = await createTopupCheckoutMutation.mutateAsync({
        amountCents,
        currency: WALLET_CONFIG.currency.toLowerCase(),
        idempotencyKey: crypto.randomUUID(),
      });

      setTopupAmount("");
      setTopupDialogOpen(false);

      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to create top-up.";
      toast.error(message);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wallet Balance</CardDescription>
            <CardTitle className="text-3xl">
              {formatAmount(availableBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={topupDialogOpen} onOpenChange={setTopupDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Top up wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Top up wallet</DialogTitle>
                  <DialogDescription>
                    Enter an amount to continue to Stripe checkout.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topup-amount">
                      Amount ({WALLET_CONFIG.currency})
                    </Label>
                    <Input
                      id="topup-amount"
                      type="number"
                      min={1}
                      step="0.01"
                      value={topupAmount}
                      onChange={(event) => setTopupAmount(event.target.value)}
                      placeholder="100"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setTopupDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleTopupRequest}
                    disabled={createTopupCheckoutMutation.isPending}
                  >
                    {createTopupCheckoutMutation.isPending
                      ? "Redirecting..."
                      : "Continue"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Top-ups</CardDescription>
            <CardTitle>{formatAmount(topupBalance)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              Credited via Stripe
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Wallet Spend</CardDescription>
            <CardTitle>{formatAmount(walletSpend)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <ArrowUpRight className="h-4 w-4 text-red-600" />
              Booking payments
            </div>
          </CardContent>
        </Card>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Top-ups and wallet booking payments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`client-wallet-loading-${index}`}
                      className="h-12 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              ) : transactions.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No wallet transactions yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {formatDate(transaction.createdAt)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell className="capitalize">
                          {transaction.type}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              statusClass[transaction.status] ??
                              "bg-slate-100 text-slate-700"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            transaction.amount < 0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          {transaction.amount < 0 ? "-" : "+"}
                          {formatAmount(Math.abs(transaction.amount))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground inline-flex items-center gap-2">
        <Wallet className="h-4 w-4" />
        Stripe is the top-up provider for client wallets.
      </div>
    </div>
  );
};
