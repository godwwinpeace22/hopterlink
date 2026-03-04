import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type WalletTopup = {
  id: string;
  amount_cents: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  created_at: string;
  failure_reason: string | null;
};

export function useWalletTopups(userId?: string | null) {
  const query = useQuery({
    queryKey: ["wallet-topups", userId],
    queryFn: async () => {
      if (!userId) return [] as WalletTopup[];

      const { data, error } = await supabase
        .from("wallet_topups")
        .select(
          "id, amount_cents, currency, status, created_at, failure_reason",
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []) as WalletTopup[];
    },
    enabled: Boolean(userId),
  });

  return {
    topups: query.data ?? [],
    isLoading: query.isLoading,
    errorMessage: query.error instanceof Error ? query.error.message : null,
    refresh: query.refetch,
  };
}
