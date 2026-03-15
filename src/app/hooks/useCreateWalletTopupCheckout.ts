import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type CreateWalletTopupCheckoutPayload = {
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  successUrl?: string;
  cancelUrl?: string;
};

export type CreateWalletTopupCheckoutResult = {
  topupId: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  checkoutUrl: string;
  reused: boolean;
};

export function useCreateWalletTopupCheckout() {
  return useMutation({
    mutationFn: async (
      payload: CreateWalletTopupCheckoutPayload,
    ): Promise<CreateWalletTopupCheckoutResult> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Your session expired. Please sign in again.");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-wallet-topup-checkout",
        {
          body: payload,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (error) {
        if (error.message.toLowerCase().includes("401")) {
          throw new Error("Unauthorized request. Please sign in again.");
        }
        throw new Error(error.message);
      }

      if (!data || typeof data.checkoutUrl !== "string") {
        throw new Error("Unable to start Stripe checkout.");
      }

      return data as CreateWalletTopupCheckoutResult;
    },
  });
}
