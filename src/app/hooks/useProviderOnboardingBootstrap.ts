import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import {
  getProviderOnboardingSnapshot,
  type ProviderOnboardingStep,
} from "@/lib/providerOnboarding";

export type ProviderOnboardingDocument = {
  document_type: "id" | "insurance";
  file_name: string | null;
  file_url: string;
  status:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "expired"
    | null;
};

export type ProviderOnboardingBootstrap = {
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  hasSubmittedVerification: boolean;
  resumeStep: ProviderOnboardingStep;
  profile: {
    full_name: string | null;
    phone: string | null;
    phone_verified: boolean | null;
    avatar_url: string | null;
    metadata: unknown;
  } | null;
  providerProfile: {
    business_name: string | null;
    bio: string | null;
    hourly_rate: number | null;
    service_areas: string[] | null;
    services: string[];
    availability: unknown;
    verification_status:
      | "not_started"
      | "pending"
      | "approved"
      | "rejected"
      | "expired"
      | null;
  } | null;
  documents: ProviderOnboardingDocument[];
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
          profile: null,
          providerProfile: null,
          documents: [],
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
          .select("full_name, phone, phone_verified, avatar_url, metadata")
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("provider_profiles")
          .select(
            "business_name, verification_status, bio, hourly_rate, service_areas, services, availability",
          )
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("verification_documents")
          .select("document_type, file_name, file_url, status")
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
      const documents =
        ((documentsResult.data ?? []) as ProviderOnboardingDocument[]) ?? [];
      const snapshot = getProviderOnboardingSnapshot({
        emailVerified,
        profile: profileData,
        providerProfile: providerData,
        documents,
      });

      return {
        emailVerified,
        phone: profileData?.phone ?? "",
        phoneVerified: Boolean(profileData?.phone_verified),
        hasSubmittedVerification: snapshot.hasSubmittedVerification,
        resumeStep: snapshot.resumeStep,
        profile: profileData,
        providerProfile: providerData,
        documents,
      };
    },
  });
}
