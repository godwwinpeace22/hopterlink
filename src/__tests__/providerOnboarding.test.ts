import {
  buildProviderPayoutMetadataPatch,
  buildWeeklyAvailability,
  getProviderOnboardingSnapshot,
  getSelectedWeekdaysFromAvailability,
} from "@/lib/providerOnboarding";
import { describe, expect, test } from "bun:test";

describe("getProviderOnboardingSnapshot", () => {
  test("stops at email verification first", () => {
    expect(
      getProviderOnboardingSnapshot({
        emailVerified: false,
        profile: null,
        providerProfile: null,
        documents: [],
      }).resumeStep,
    ).toBe("email-verify");
  });

  test("requires documents after email verification", () => {
    expect(
      getProviderOnboardingSnapshot({
        emailVerified: true,
        profile: { avatar_url: null, metadata: null },
        providerProfile: { bio: null, hourly_rate: null, availability: null },
        documents: [{ document_type: "id" }],
      }).resumeStep,
    ).toBe("documents");
  });

  test("reaches review when setup is complete but not submitted", () => {
    expect(
      getProviderOnboardingSnapshot({
        emailVerified: true,
        profile: {
          avatar_url: "https://example.com/avatar.jpg",
          metadata: { payout: { last4: "4242" } },
        },
        providerProfile: {
          bio: "Trusted provider",
          hourly_rate: 75,
          availability: { "2026-03-09": [{ start: "09:00", end: "17:00" }] },
          verification_status: "not_started",
        },
        documents: [{ document_type: "id" }, { document_type: "insurance" }],
      }).resumeStep,
    ).toBe("review");
  });

  test("moves to pending after submission", () => {
    expect(
      getProviderOnboardingSnapshot({
        emailVerified: true,
        profile: {
          avatar_url: "https://example.com/avatar.jpg",
          metadata: { payout: { last4: "4242" } },
        },
        providerProfile: {
          bio: "Trusted provider",
          hourly_rate: 75,
          availability: { "2026-03-09": [{ start: "09:00", end: "17:00" }] },
          verification_status: "pending",
        },
        documents: [{ document_type: "id" }, { document_type: "insurance" }],
      }).resumeStep,
    ).toBe("pending");
  });
});

describe("buildProviderPayoutMetadataPatch", () => {
  test("preserves unrelated metadata while replacing payout details", () => {
    expect(
      buildProviderPayoutMetadataPatch(
        { theme: "dark", payout: { last4: "1111" } },
        {
          bankName: "RBC",
          accountType: "Checking",
          accountNumberLast4: "4242",
        },
      ),
    ).toEqual({
      theme: "dark",
      payout: {
        bankName: "RBC",
        accountType: "Checking",
        last4: "4242",
      },
    });
  });
});

describe("availability helpers", () => {
  test("builds canonical weekly availability", () => {
    expect(buildWeeklyAvailability(["monday", "wednesday"])).toMatchObject({
      version: 2,
      timezone: "Africa/Lagos",
      recurring: true,
      dates: {},
      weekly: {
        monday: {
          mode: "custom",
          ranges: [{ start: "09:00", end: "17:00" }],
        },
        tuesday: { mode: "unavailable", ranges: [] },
        wednesday: {
          mode: "custom",
          ranges: [{ start: "09:00", end: "17:00" }],
        },
      },
    });
  });

  test("extracts weekdays from date-keyed availability", () => {
    expect(
      getSelectedWeekdaysFromAvailability({
        "2026-03-09": [{ start: "09:00", end: "17:00" }],
        "2026-03-11": [{ start: "09:00", end: "17:00" }],
      }),
    ).toEqual(["monday", "wednesday"]);
  });

  test("extracts weekdays from canonical weekly availability", () => {
    expect(
      getSelectedWeekdaysFromAvailability({
        weekly: {
          monday: {
            mode: "all_day",
            ranges: [{ start: "00:00", end: "24:00" }],
          },
          tuesday: { mode: "unavailable", ranges: [] },
          wednesday: {
            mode: "custom",
            ranges: [{ start: "09:00", end: "17:00" }],
          },
          thursday: { mode: "unavailable", ranges: [] },
          friday: { mode: "unavailable", ranges: [] },
          saturday: { mode: "unavailable", ranges: [] },
          sunday: { mode: "unavailable", ranges: [] },
        },
      }),
    ).toEqual(["monday", "wednesday"]);
  });
});
