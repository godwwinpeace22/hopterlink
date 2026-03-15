import {
  formatNotificationTime,
  NOTIFICATION_ICONS,
  resolveNotificationRoute,
} from "@/lib/notificationHelpers";
import { describe, expect, test } from "bun:test";

// ── All known notification types (must match the DB enum) ──────────────
const ALL_TYPES = [
  "job_posted",
  "quote_received",
  "quote_accepted",
  "message_received",
  "booking_confirmed",
  "payment_released",
  "review_received",
  "verification_approved",
  "reward_earned",
] as const;

// ────────────────────────────────────────────────────────────────────────
// resolveNotificationRoute — client paths
// ────────────────────────────────────────────────────────────────────────
describe("resolveNotificationRoute (client)", () => {
  const id = "abc-123";

  test("booking_confirmed → client bookings", () => {
    const r = resolveNotificationRoute("booking_confirmed", id, false);
    expect(r).toEqual({
      path: "/dashboard/client/bookings",
    });
  });

  test("quote_received → client my-jobs detail", () => {
    const r = resolveNotificationRoute("quote_received", id, false);
    expect(r).toEqual({
      path: `/dashboard/client/my-jobs/${id}`,
    });
  });

  test("quote_accepted → client my-jobs detail", () => {
    const r = resolveNotificationRoute("quote_accepted", id, false);
    expect(r).toEqual({
      path: `/dashboard/client/my-jobs/${id}`,
    });
  });

  test("job_posted → client my-jobs detail", () => {
    const r = resolveNotificationRoute("job_posted", id, false);
    expect(r).toEqual({
      path: `/dashboard/client/my-jobs/${id}`,
    });
  });

  test("message_received → client messages", () => {
    const r = resolveNotificationRoute("message_received", id, false);
    expect(r).toEqual({
      path: "/dashboard/client/messages",
    });
  });

  test("payment_released → client wallet", () => {
    const r = resolveNotificationRoute("payment_released", id, false);
    expect(r).toEqual({
      path: "/dashboard/client/wallet",
    });
  });

  test("review_received → client reviews", () => {
    const r = resolveNotificationRoute("review_received", id, false);
    expect(r).toEqual({
      path: "/dashboard/client/reviews",
    });
  });

  test("verification_approved → provider settings", () => {
    const r = resolveNotificationRoute("verification_approved", id, false);
    expect(r).toEqual({
      path: "/dashboard/client/settings",
    });
  });

  test("reward_earned → client wallet", () => {
    const r = resolveNotificationRoute("reward_earned", id, false);
    expect(r).toEqual({
      path: "/dashboard/client/wallet",
    });
  });
});

// ────────────────────────────────────────────────────────────────────────
// resolveNotificationRoute — provider paths
// ────────────────────────────────────────────────────────────────────────
describe("resolveNotificationRoute (provider)", () => {
  const id = "prov-456";

  test("booking_confirmed → provider bookings", () => {
    const r = resolveNotificationRoute("booking_confirmed", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/bookings",
    });
  });

  test("quote_received → provider jobs", () => {
    const r = resolveNotificationRoute("quote_received", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/jobs",
    });
  });

  test("quote_accepted → provider jobs", () => {
    const r = resolveNotificationRoute("quote_accepted", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/jobs",
    });
  });

  test("message_received → provider messages", () => {
    const r = resolveNotificationRoute("message_received", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/messages",
    });
  });

  test("payment_released → provider wallet", () => {
    const r = resolveNotificationRoute("payment_released", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/wallet",
    });
  });

  test("review_received → provider reviews", () => {
    const r = resolveNotificationRoute("review_received", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/reviews",
    });
  });

  test("job_posted → provider jobs", () => {
    const r = resolveNotificationRoute("job_posted", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/jobs",
    });
  });

  test("verification_approved → provider settings", () => {
    const r = resolveNotificationRoute("verification_approved", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/settings",
    });
  });

  test("reward_earned → provider wallet", () => {
    const r = resolveNotificationRoute("reward_earned", id, true);
    expect(r).toEqual({
      path: "/dashboard/provider/wallet",
    });
  });
});

// ────────────────────────────────────────────────────────────────────────
// resolveNotificationRoute — edge cases
// ────────────────────────────────────────────────────────────────────────
describe("resolveNotificationRoute (edge cases)", () => {
  test("returns null when relatedId is null", () => {
    expect(
      resolveNotificationRoute("booking_confirmed", null, false),
    ).toBeNull();
  });

  test("returns null for unknown type", () => {
    expect(resolveNotificationRoute("totally_unknown", "id", false)).toBeNull();
  });

  test("returns null for empty string relatedId", () => {
    expect(resolveNotificationRoute("booking_confirmed", "", false)).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────────────
// formatNotificationTime
// ────────────────────────────────────────────────────────────────────────
describe("formatNotificationTime", () => {
  test("returns empty string for null", () => {
    expect(formatNotificationTime(null)).toBe("");
  });

  test("returns 'just now' for timestamps less than a minute ago", () => {
    const now = new Date();
    expect(formatNotificationTime(now.toISOString())).toBe("just now");
  });

  test("formats minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
    expect(formatNotificationTime(fiveMinAgo)).toBe("5m ago");
  });

  test("formats hours ago", () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3_600_000).toISOString();
    expect(formatNotificationTime(threeHoursAgo)).toBe("3h ago");
  });

  test("formats days ago", () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86_400_000).toISOString();
    expect(formatNotificationTime(twoDaysAgo)).toBe("2d ago");
  });

  test("formats older dates as 'Mon DD'", () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86_400_000);
    const result = formatNotificationTime(twoWeeksAgo.toISOString());
    expect(result).toMatch(/^[A-Z][a-z]{2} \d{1,2}$/);
  });
});

// ────────────────────────────────────────────────────────────────────────
// NOTIFICATION_ICONS — completeness
// ────────────────────────────────────────────────────────────────────────
describe("NOTIFICATION_ICONS", () => {
  test("has an icon for every notification type in the enum", () => {
    for (const type of ALL_TYPES) {
      expect(NOTIFICATION_ICONS[type]).toBeDefined();
      expect(typeof NOTIFICATION_ICONS[type]).toBe("string");
      expect(NOTIFICATION_ICONS[type].length).toBeGreaterThan(0);
    }
  });

  test("has no extra keys beyond the enum", () => {
    const iconKeys = Object.keys(NOTIFICATION_ICONS);
    expect(iconKeys.sort()).toEqual([...ALL_TYPES].sort());
  });
});
