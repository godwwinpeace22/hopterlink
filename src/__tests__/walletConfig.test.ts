import { describe, test, expect } from "bun:test";
import {
  WALLET_CONFIG,
  WALLET_STATUS_LABELS,
  TOPUP_STATUS_LABELS,
} from "@/app/config/walletConfig";

describe("WALLET_CONFIG", () => {
  test("has correct currency", () => {
    expect(WALLET_CONFIG.currency).toBe("CAD");
  });

  test("has a valid payout day index (1-7)", () => {
    expect(WALLET_CONFIG.payoutDayIndex).toBeGreaterThanOrEqual(0);
    expect(WALLET_CONFIG.payoutDayIndex).toBeLessThanOrEqual(6);
  });

  test("minimum withdrawal amount is positive", () => {
    expect(WALLET_CONFIG.minimumWithdrawalAmount).toBeGreaterThan(0);
  });

  test("stripe topup is enabled", () => {
    expect(WALLET_CONFIG.stripeTopupEnabled).toBe(true);
  });
});

describe("WALLET_STATUS_LABELS", () => {
  test("has labels for all withdrawal statuses", () => {
    const expected = [
      "requested",
      "queued",
      "processing",
      "paid",
      "failed",
      "cancelled",
    ] as const;
    for (const status of expected) {
      expect(WALLET_STATUS_LABELS[status]).toBeDefined();
      expect(typeof WALLET_STATUS_LABELS[status]).toBe("string");
    }
  });
});

describe("TOPUP_STATUS_LABELS", () => {
  test("has labels for all topup statuses", () => {
    const expected = ["pending", "succeeded", "failed"] as const;
    for (const status of expected) {
      expect(TOPUP_STATUS_LABELS[status]).toBeDefined();
      expect(typeof TOPUP_STATUS_LABELS[status]).toBe("string");
    }
  });
});
