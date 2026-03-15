import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useSupabaseQuery } from "@/lib/useSupabaseQuery";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "../../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Badge } from "../../../ui/badge";
import { Input } from "../../../ui/input";
import { Label } from "../../../ui/label";
import { PageHeader } from "../../../ui/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";
import { WALLET_CONFIG, WALLET_STATUS_LABELS } from "@/app/config/walletConfig";
import {
  ProviderWalletTransaction,
  normalizeProviderWalletMetadata,
} from "@/app/lib/providerWalletMetadata";

type EarningPayment = {
  id: string;
  amount: number;
  status: string;
  created_at: string | null;
  metadata: { payment_kind?: string; note?: string | null } | null;
  booking: { service_type: string | null } | null;
  client: { full_name: string | null } | null;
};

type ProviderWithdrawal = {
  id: string;
  amount: number;
  status: string;
  requestedAt: string;
  payoutReference?: string;
  note?: string;
};

const walletStatusBadgeClass: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  requested: "bg-amber-100 text-amber-700",
  queued: "bg-orange-100 text-orange-700",
  processing: "bg-[#FFF1D6] text-[#A15C00]",
  paid: "bg-emerald-100 text-emerald-700",
  failed: "bg-red-100 text-red-700",
  rejected: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-700",
};

const withdrawalStatusLabels: Record<string, string> = {
  pending: "Pending",
  requested: WALLET_STATUS_LABELS.requested,
  queued: WALLET_STATUS_LABELS.queued,
  processing: WALLET_STATUS_LABELS.processing,
  paid: WALLET_STATUS_LABELS.paid,
  failed: WALLET_STATUS_LABELS.failed,
  rejected: "Rejected",
  cancelled: WALLET_STATUS_LABELS.cancelled,
};

const earningStatusBadgeClass: Record<string, string> = {
  released: "bg-emerald-100 text-emerald-700",
  held: "bg-amber-100 text-amber-700",
  pending: "bg-[#FFF1D6] text-[#A15C00]",
  refunded: "bg-red-100 text-red-700",
  disputed: "bg-red-100 text-red-700",
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: WALLET_CONFIG.currency,
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (dateInput: string | null) => {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const getNextPayoutDate = () => {
  const date = new Date();
  const daysUntilPayout =
    (WALLET_CONFIG.payoutDayIndex - date.getDay() + 7) % 7 || 7;

  date.setDate(date.getDate() + daysUntilPayout);

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

export const ProviderWallet = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");

  const paymentsQuery = useSupabaseQuery(
    ["provider_wallet_payments", user?.id],
    () =>
      supabase
        .from("escrow_payments")
        .select(
          `
            id,
            provider_amount,
            status,
            created_at,
            metadata,
            booking:bookings (
              service_type
            ),
            client:profiles!escrow_payments_client_id_fkey (
              full_name
            )
          `,
        )
        .eq("provider_id", user?.id ?? "")
        .order("created_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  const profileMetadataQuery = useSupabaseQuery(
    ["profile_metadata", user?.id],
    () =>
      supabase
        .from("profiles")
        .select("metadata")
        .eq("id", user?.id ?? "")
        .single(),
    { enabled: Boolean(user?.id) },
  );

  const withdrawalsQuery = useSupabaseQuery(
    ["provider_withdrawal_requests", user?.id],
    () =>
      supabase
        .from("withdrawal_requests")
        .select("id, amount, status, requested_at, payout_reference, note")
        .eq("provider_id", user?.id ?? "")
        .order("requested_at", { ascending: false }),
    { enabled: Boolean(user?.id) },
  );

  const isLoading =
    paymentsQuery.isLoading ||
    profileMetadataQuery.isLoading ||
    withdrawalsQuery.isLoading;
  const errorMessage =
    paymentsQuery.data?.error?.message ??
    withdrawalsQuery.data?.error?.message ??
    profileMetadataQuery.data?.error?.message ??
    null;

  const payments = useMemo<EarningPayment[]>(() => {
    const data = paymentsQuery.data?.data ?? [];

    return data.map((payment) => ({
      id: payment.id,
      amount: Number(payment.provider_amount ?? 0),
      status: payment.status ?? "pending",
      created_at: payment.created_at,
      metadata: payment.metadata,
      booking: payment.booking,
      client: payment.client,
    }));
  }, [paymentsQuery.data?.data]);

  const walletMetadata = useMemo(
    () =>
      normalizeProviderWalletMetadata(
        profileMetadataQuery.data?.data?.metadata,
      ),
    [profileMetadataQuery.data?.data?.metadata],
  );

  const withdrawalRequests = useMemo<ProviderWithdrawal[]>(() => {
    const data = withdrawalsQuery.data?.data ?? [];

    return data.map((request) => ({
      id: request.id,
      amount: Number(request.amount ?? 0),
      status: request.status ?? "pending",
      requestedAt: request.requested_at ?? new Date().toISOString(),
      payoutReference: request.payout_reference ?? undefined,
      note: request.note ?? undefined,
    }));
  }, [withdrawalsQuery.data?.data]);

  const releasedEarnings = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === "released")
        .reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );

  const pendingEarnings = useMemo(
    () =>
      payments
        .filter(
          (payment) =>
            payment.status === "pending" || payment.status === "held",
        )
        .reduce((sum, payment) => sum + payment.amount, 0),
    [payments],
  );

  const totalCommittedWithdrawals = useMemo(
    () =>
      withdrawalRequests
        .filter(
          (request) =>
            request.status !== "rejected" && request.status !== "cancelled",
        )
        .reduce((sum, request) => sum + request.amount, 0),
    [withdrawalRequests],
  );

  const pendingWithdrawals = useMemo(
    () =>
      withdrawalRequests
        .filter(
          (request) =>
            request.status === "pending" ||
            request.status === "requested" ||
            request.status === "queued" ||
            request.status === "processing",
        )
        .reduce((sum, request) => sum + request.amount, 0),
    [withdrawalRequests],
  );

  const availableBalance = Math.max(
    releasedEarnings - totalCommittedWithdrawals,
    0,
  );

  const thisMonthEarnings = useMemo(() => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return payments
      .filter(
        (payment) =>
          payment.status === "released" &&
          payment.created_at &&
          new Date(payment.created_at).getTime() >= monthStart.getTime(),
      )
      .reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const allTransactions = useMemo<ProviderWalletTransaction[]>(() => {
    const earningTransactions: ProviderWalletTransaction[] = payments.map(
      (payment) => ({
        id: `earning-${payment.id}`,
        amount: payment.amount,
        type: "earning",
        status: payment.status,
        description:
          payment.metadata?.payment_kind === "booking_bonus"
            ? `Booking Bonus • ${payment.booking?.service_type ?? "Service"} • ${payment.client?.full_name ?? "Client"}`
            : `${payment.booking?.service_type ?? "Service"} • ${payment.client?.full_name ?? "Client"}`,
        createdAt: payment.created_at ?? new Date().toISOString(),
      }),
    );

    const withdrawalTransactions: ProviderWalletTransaction[] =
      withdrawalRequests.map((request) => ({
        id: `withdraw-${request.id}`,
        amount: -Math.abs(request.amount),
        type: "withdrawal",
        status: request.status,
        description: "Withdrawal request",
        createdAt: request.requestedAt,
      }));

    return [...earningTransactions, ...withdrawalTransactions].sort(
      (first, second) =>
        new Date(second.createdAt).getTime() -
        new Date(first.createdAt).getTime(),
    );
  }, [payments, withdrawalRequests]);

  const canWithdraw =
    walletMetadata.bankAccount?.verified &&
    availableBalance >= WALLET_CONFIG.minimumWithdrawalAmount;

  const withdrawAmountNumber = Number(withdrawAmount);
  const exceedsAvailableBalance =
    Number.isFinite(withdrawAmountNumber) &&
    withdrawAmountNumber > availableBalance;

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("Enter a valid withdrawal amount.");
      return;
    }

    if (amount < WALLET_CONFIG.minimumWithdrawalAmount) {
      toast.error(
        `Minimum withdrawal is ${formatAmount(WALLET_CONFIG.minimumWithdrawalAmount)}.`,
      );
      return;
    }

    if (!walletMetadata.bankAccount?.verified) {
      toast.error("Add and verify your bank account in Settings first.");
      return;
    }

    if (amount > availableBalance) {
      toast.error("Withdrawal amount exceeds available balance.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.rpc("request_withdrawal", {
        p_amount: amount,
        p_currency: WALLET_CONFIG.currency,
        p_note: null,
      });

      if (error) {
        throw error;
      }

      await queryClient.invalidateQueries({
        queryKey: ["provider_withdrawal_requests", user?.id],
      });
      setWithdrawAmount("");
      setWithdrawDialogOpen(false);
      toast.success("Withdrawal request submitted for payout processing.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to submit request.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pt-6">
      <PageHeader title="Wallet" hideBack />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available Balance</CardDescription>
            <CardTitle className="text-3xl">
              {formatAmount(availableBalance)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Badge variant="secondary" className="gap-1">
              <Wallet className="h-3.5 w-3.5" />
              Pending {formatAmount(pendingEarnings)}
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Next auto run: {getNextPayoutDate()}
            </Badge>
            <Dialog
              open={withdrawDialogOpen}
              onOpenChange={setWithdrawDialogOpen}
            >
              <DialogTrigger asChild>
                <Button disabled={!canWithdraw}>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Withdraw funds
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Withdrawal</DialogTitle>
                  <DialogDescription>
                    Withdrawals are reviewed and paid manually by operations for
                    now.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount">
                      Amount ({WALLET_CONFIG.currency})
                    </Label>
                    <Input
                      id="withdraw-amount"
                      type="number"
                      min={WALLET_CONFIG.minimumWithdrawalAmount}
                      step="0.01"
                      value={withdrawAmount}
                      onChange={(event) =>
                        setWithdrawAmount(event.target.value)
                      }
                      placeholder={`${WALLET_CONFIG.minimumWithdrawalAmount}`}
                    />

                    {exceedsAvailableBalance && (
                      <p className="text-sm font-medium text-red-600">
                        Amount exceeds your available balance.
                      </p>
                    )}
                    <div className="rounded-md max-w-fit bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                      Available now:{" "}
                      <span className="font-semibold text-foreground">
                        {formatAmount(availableBalance)}
                      </span>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setWithdrawDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    disabled={
                      !canWithdraw || isSubmitting || exceedsAvailableBalance
                    }
                    onClick={handleWithdraw}
                  >
                    {isSubmitting ? "Submitting..." : "Submit withdrawal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Released Earnings</CardDescription>
            <CardTitle>{formatAmount(releasedEarnings)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
              Lifetime settled earnings
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Earnings This Month</CardDescription>
            <CardTitle>{formatAmount(thisMonthEarnings)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-sm text-muted-foreground gap-1">
              <Banknote className="h-4 w-4 text-amber-600" />
              Pending release: {formatAmount(pendingEarnings)}
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
          <TabsTrigger value="withdrawal-requests">
            Withdrawal Requests
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Earnings, top-ups, and withdrawals in a single ledger view.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={`transaction-loading-${index}`}
                      className="h-12 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              ) : allTransactions.length === 0 ? (
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
                    {allTransactions.map((transaction) => (
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
                              transaction.type === "withdrawal"
                                ? walletStatusBadgeClass[transaction.status]
                                : (earningStatusBadgeClass[
                                    transaction.status
                                  ] ?? "bg-slate-100 text-slate-700")
                            }
                          >
                            {transaction.type === "withdrawal"
                              ? WALLET_STATUS_LABELS[
                                  transaction.status as keyof typeof WALLET_STATUS_LABELS
                                ]
                              : transaction.status}
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

        <TabsContent value="withdrawal-requests">
          <Card>
            <CardHeader>
              <CardTitle>Withdrawal Requests</CardTitle>
              <CardDescription>
                Track submitted withdrawals and payout processing status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={`withdraw-loading-${index}`}
                      className="h-12 animate-pulse rounded-md bg-muted"
                    />
                  ))}
                </div>
              ) : withdrawalRequests.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No withdrawals yet.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {withdrawalRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{formatDate(request.requestedAt)}</TableCell>
                        <TableCell className="font-medium">
                          {formatAmount(request.amount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              walletStatusBadgeClass[request.status] ??
                              "bg-slate-100 text-slate-700"
                            }
                          >
                            {withdrawalStatusLabels[request.status] ??
                              request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {request.payoutReference ?? request.note ?? "—"}
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

      <div className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
        Auto requests run every {WALLET_CONFIG.payoutDayLabel} (
        {WALLET_CONFIG.timezone}). Minimum withdrawal is{" "}
        {formatAmount(WALLET_CONFIG.minimumWithdrawalAmount)}.
      </div>
    </div>
  );
};
