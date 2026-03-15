import type { Json } from "@/lib/database.types";
import {
  AVAILABILITY_WEEKDAYS,
  buildUnavailableWeeklyAvailability,
  DEFAULT_TIMEZONE,
  LEGACY_DEFAULT_RANGE,
  normalizeAvailability,
  type AvailabilityWeekday,
} from "@/lib/providerAvailability";

type JsonObject = { [key: string]: Json | undefined };

export type ProviderOnboardingStep =
  | "email-verify"
  | "documents"
  | "profile"
  | "availability"
  | "payment"
  | "review"
  | "pending";

export type ProviderOnboardingWeekday = AvailabilityWeekday;

export const PROVIDER_ONBOARDING_WEEKDAYS: ProviderOnboardingWeekday[] = [
  ...AVAILABILITY_WEEKDAYS,
];

type ProviderProfileFields = {
  bio?: string | null;
  hourly_rate?: number | null;
  availability?: unknown;
  verification_status?:
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "expired"
    | null;
};

type ProfileFields = {
  avatar_url?: string | null;
  metadata?: unknown;
};

type VerificationDocumentFields = {
  document_type?: string | null;
};

export type ProviderOnboardingSnapshot = {
  hasRequiredDocs: boolean;
  hasProfileSetup: boolean;
  hasAvailability: boolean;
  hasPaymentSetup: boolean;
  hasSubmittedVerification: boolean;
  resumeStep: ProviderOnboardingStep;
};

const isObject = (value: unknown): value is JsonObject =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export function hasProviderAvailability(value: unknown) {
  if (!isObject(value)) {
    return false;
  }

  if (isObject(value.weekly)) {
    const normalized = normalizeAvailability(value);
    return PROVIDER_ONBOARDING_WEEKDAYS.some(
      (weekday) => normalized.weekly[weekday].mode !== "unavailable",
    );
  }

  const source =
    isObject(value.dates) && Object.keys(value.dates).length > 0
      ? (value.dates as JsonObject)
      : value;

  return Object.keys(source).length > 0;
}

export function getProviderOnboardingSnapshot(params: {
  emailVerified: boolean;
  profile: ProfileFields | null | undefined;
  providerProfile: ProviderProfileFields | null | undefined;
  documents: VerificationDocumentFields[] | null | undefined;
}): ProviderOnboardingSnapshot {
  const { emailVerified, profile, providerProfile, documents } = params;

  const documentTypes = new Set(
    (documents ?? []).map((document) => document.document_type).filter(Boolean),
  );

  const hasRequiredDocs =
    documentTypes.has("id") && documentTypes.has("insurance");
  const hasProfileSetup =
    Boolean(profile?.avatar_url) &&
    Boolean(providerProfile?.bio) &&
    providerProfile?.hourly_rate != null;
  const hasAvailability = hasProviderAvailability(
    providerProfile?.availability,
  );

  const payout = (
    isObject(profile?.metadata) ? (profile?.metadata as JsonObject) : {}
  ).payout;
  const hasPaymentSetup =
    isObject(payout) &&
    typeof payout.last4 === "string" &&
    payout.last4.length > 0;

  const hasSubmittedVerification =
    providerProfile?.verification_status === "pending" ||
    providerProfile?.verification_status === "approved";

  let resumeStep: ProviderOnboardingStep = "email-verify";

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
    hasRequiredDocs,
    hasProfileSetup,
    hasAvailability,
    hasPaymentSetup,
    hasSubmittedVerification,
    resumeStep,
  };
}

export function buildProviderPayoutMetadataPatch(
  currentMetadata: unknown,
  payout: {
    bankName: string;
    accountType: string;
    accountNumberLast4: string;
  },
): JsonObject {
  const metadata = isObject(currentMetadata) ? { ...currentMetadata } : {};

  return {
    ...metadata,
    payout: {
      bankName: payout.bankName.trim(),
      accountType: payout.accountType.trim(),
      last4: payout.accountNumberLast4.trim(),
    },
  };
}

export function buildWeeklyAvailability(
  selectedDays: ProviderOnboardingWeekday[],
  timezone = DEFAULT_TIMEZONE,
) {
  const chosenDays = new Set(selectedDays);
  const weekly = buildUnavailableWeeklyAvailability();

  for (const weekday of PROVIDER_ONBOARDING_WEEKDAYS) {
    if (!chosenDays.has(weekday)) {
      continue;
    }

    weekly[weekday] = {
      mode: "custom",
      ranges: [{ ...LEGACY_DEFAULT_RANGE }],
    };
  }

  return {
    version: 2,
    timezone,
    recurring: true,
    settings: {
      timezone,
      recurring: true,
    },
    weekly,
    dates: {},
  };
}

export function getSelectedWeekdaysFromAvailability(value: unknown) {
  if (!isObject(value)) {
    return [] as ProviderOnboardingWeekday[];
  }

  if (isObject(value.weekly)) {
    const normalized = normalizeAvailability(value);
    return PROVIDER_ONBOARDING_WEEKDAYS.filter(
      (weekday) => normalized.weekly[weekday].mode !== "unavailable",
    );
  }

  const source = isObject(value.dates) ? (value.dates as JsonObject) : value;
  const selected = new Set<ProviderOnboardingWeekday>();

  for (const key of Object.keys(source)) {
    if (
      PROVIDER_ONBOARDING_WEEKDAYS.includes(key as ProviderOnboardingWeekday)
    ) {
      selected.add(key as ProviderOnboardingWeekday);
      continue;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
      continue;
    }

    const date = new Date(`${key}T12:00:00`);
    const weekday = date
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as ProviderOnboardingWeekday;
    selected.add(weekday);
  }

  return PROVIDER_ONBOARDING_WEEKDAYS.filter((weekday) =>
    selected.has(weekday),
  );
}
