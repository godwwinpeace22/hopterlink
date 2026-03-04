import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type ProviderOnboardingBootstrap = {
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  hasSubmittedVerification: boolean;
  resumeStep:
    | "email-verify"
    | "documents"
    | "profile"
    | "availability"
    | "payment"
    | "review"
    | "pending";
};

export function useProviderOnboardingBootstrap(userId?: string) {
  return useQuery({
    queryKey: ["provider-onboarding-bootstrap", userId],
    enabled: Boolean(userId),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async (): Promise<ProviderOnboardingBootstrap> => {
      if (!userId) {
        return {
          emailVerified: false,
          phone: "",
          phoneVerified: false,
          hasSubmittedVerification: false,
          resumeStep: "email-verify",
        };
      }

      const [
        { data: authData },
        profileResult,
        providerProfileResult,
        documentsResult,
      ] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from("profiles")
          .select("phone, phone_verified, avatar_url, metadata")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("provider_profiles")
          .select("verification_status, bio, hourly_rate, availability")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("verification_documents")
          .select("document_type")
          .eq("provider_id", userId)
          .in("document_type", ["id", "insurance"]),
      ]);

      if (profileResult.error) {
        throw profileResult.error;
      }

      if (providerProfileResult.error) {
        throw providerProfileResult.error;
      }

      if (documentsResult.error) {
        throw documentsResult.error;
      }

      const emailVerified = Boolean(authData.user?.email_confirmed_at);
      const profileData = profileResult.data;
      const providerData = providerProfileResult.data;
      const documentTypes = new Set(
        (documentsResult.data ?? []).map((doc) => doc.document_type),
      );

      const hasRequiredDocs =
        documentTypes.has("id") && documentTypes.has("insurance");
      const hasProfileSetup =
        Boolean(profileData?.avatar_url) &&
        Boolean(providerData?.bio) &&
        providerData?.hourly_rate != null;
      const hasAvailability =
        Boolean(providerData?.availability) &&
        typeof providerData?.availability === "object" &&
        Object.keys(providerData.availability as Record<string, unknown>)
          .length > 0;

      const payout = (
        profileData?.metadata as { payout?: { last4?: string } } | null
      )?.payout;
      const hasPaymentSetup = Boolean(payout?.last4);

      const hasSubmittedVerification =
        providerData?.verification_status === "pending" ||
        providerData?.verification_status === "approved";

      let resumeStep: ProviderOnboardingBootstrap["resumeStep"] =
        "email-verify";

      if (!emailVerified) {
        resumeStep = "email-verify";
      } else if (!hasRequiredDocs) {
        resumeStep = "documents";
      } else if (!hasProfileSetup) {
        resumeStep = "profile";
      } else if (!hasAvailability) {
        resumeStep = "availability";
      } else if (!hasPaymentSetup) {
        resumeStep = "payment";
      } else if (hasSubmittedVerification) {
        resumeStep = "pending";
      } else {
        resumeStep = "review";
      }

      return {
        emailVerified,
        phone: profileData?.phone ?? "",
        phoneVerified: Boolean(profileData?.phone_verified),
        hasSubmittedVerification,
        resumeStep,
      };
    },
  });
}
