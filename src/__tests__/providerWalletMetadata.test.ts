import { describe, test, expect } from "bun:test";
import {
  normalizeProviderWalletMetadata,
  buildWalletMetadataPatch,
  type ProviderWalletMetadata,
} from "@/app/lib/providerWalletMetadata";

const validWithdrawal = {
  id: "w1",
  amount: 100,
  status: "requested",
  requestedAt: "2026-01-15T10:00:00Z",
};

const validTopup = {
  id: "t1",
  amount: 50,
  status: "pending",
  requestedAt: "2026-01-15T10:00:00Z",
};

const validBankAccount = {
  accountName: "Jane Doe",
  bankName: "TD Bank",
  institutionNumber: "004",
  transitNumber: "12345",
  accountNumber: "1234567",
  country: "CA",
  currency: "CAD",
  verified: true,
};

describe("normalizeProviderWalletMetadata", () => {
  test("returns defaults for null input", () => {
    const result = normalizeProviderWalletMetadata(null);
    expect(result).toEqual({
      autoWithdrawalEnabled: false,
      bankAccount: null,
      withdrawalRequests: [],
      topupRequests: [],
    });
  });

  test("returns defaults for non-object input", () => {
    expect(normalizeProviderWalletMetadata("string")).toEqual({
      autoWithdrawalEnabled: false,
      bankAccount: null,
      withdrawalRequests: [],
      topupRequests: [],
    });
    expect(normalizeProviderWalletMetadata(42)).toEqual({
      autoWithdrawalEnabled: false,
      bankAccount: null,
      withdrawalRequests: [],
      topupRequests: [],
    });
  });

  test("normalizes valid metadata at root level", () => {
    const result = normalizeProviderWalletMetadata({
      autoWithdrawalEnabled: true,
      bankAccount: validBankAccount,
      withdrawalRequests: [validWithdrawal],
      topupRequests: [validTopup],
    });

    expect(result.autoWithdrawalEnabled).toBe(true);
    expect(result.bankAccount).toEqual(validBankAccount);
    expect(result.withdrawalRequests).toHaveLength(1);
    expect(result.withdrawalRequests[0].id).toBe("w1");
    expect(result.topupRequests).toHaveLength(1);
    expect(result.topupRequests[0].id).toBe("t1");
  });

  test("normalizes metadata nested under wallet key", () => {
    const result = normalizeProviderWalletMetadata({
      wallet: {
        autoWithdrawalEnabled: true,
        bankAccount: validBankAccount,
        withdrawalRequests: [validWithdrawal],
        topupRequests: [validTopup],
      },
    });

    expect(result.autoWithdrawalEnabled).toBe(true);
    expect(result.withdrawalRequests).toHaveLength(1);
  });

  test("filters out invalid withdrawals", () => {
    const result = normalizeProviderWalletMetadata({
      withdrawalRequests: [
        validWithdrawal,
        {
          id: "bad",
          amount: "not-a-number",
          status: "requested",
          requestedAt: "2026-01-01",
        },
        {
          id: "w2",
          amount: 200,
          status: "invalid-status",
          requestedAt: "2026-01-01",
        },
        null,
        "string",
      ],
      topupRequests: [],
    });

    expect(result.withdrawalRequests).toHaveLength(1);
    expect(result.withdrawalRequests[0].id).toBe("w1");
  });

  test("filters out invalid topups", () => {
    const result = normalizeProviderWalletMetadata({
      withdrawalRequests: [],
      topupRequests: [
        validTopup,
        {
          id: "bad",
          amount: NaN,
          status: "pending",
          requestedAt: "2026-01-01",
        },
        null,
      ],
    });

    expect(result.topupRequests).toHaveLength(1);
  });

  test("returns null bankAccount when required fields are missing", () => {
    const result = normalizeProviderWalletMetadata({
      bankAccount: {
        accountName: "Jane",
        bankName: "",
        institutionNumber: "004",
        transitNumber: "12345",
        accountNumber: "1234567",
      },
    });

    expect(result.bankAccount).toBeNull();
  });

  test("handles withdrawal with requested_at snake_case", () => {
    const result = normalizeProviderWalletMetadata({
      withdrawalRequests: [
        { id: "w1", amount: 100, status: "paid", requested_at: "2026-03-01" },
      ],
    });

    expect(result.withdrawalRequests).toHaveLength(1);
    expect(result.withdrawalRequests[0].requestedAt).toBe("2026-03-01");
  });

  test("handles topup with requested_at snake_case", () => {
    const result = normalizeProviderWalletMetadata({
      topupRequests: [
        {
          id: "t1",
          amount: 25,
          status: "succeeded",
          requested_at: "2026-03-01",
        },
      ],
    });

    expect(result.topupRequests).toHaveLength(1);
    expect(result.topupRequests[0].requestedAt).toBe("2026-03-01");
  });

  test("handles string amount in withdrawal by converting", () => {
    const result = normalizeProviderWalletMetadata({
      withdrawalRequests: [
        {
          id: "w1",
          amount: "150",
          status: "queued",
          requestedAt: "2026-01-01",
        },
      ],
    });

    // Amount "150" gets converted to 150 via Number()
    expect(result.withdrawalRequests).toHaveLength(1);
    expect(result.withdrawalRequests[0].amount).toBe(150);
  });

  test("bankAccount defaults country to CA and currency to CAD", () => {
    const result = normalizeProviderWalletMetadata({
      bankAccount: {
        accountName: "Jane",
        bankName: "RBC",
        institutionNumber: "003",
        transitNumber: "99999",
        accountNumber: "7654321",
      },
    });

    expect(result.bankAccount!.country).toBe("CA");
    expect(result.bankAccount!.currency).toBe("CAD");
    expect(result.bankAccount!.verified).toBe(false);
  });

  test("all withdrawal statuses are accepted", () => {
    const statuses = [
      "requested",
      "queued",
      "processing",
      "paid",
      "failed",
      "cancelled",
    ] as const;
    for (const status of statuses) {
      const result = normalizeProviderWalletMetadata({
        withdrawalRequests: [
          { id: `w-${status}`, amount: 10, status, requestedAt: "2026-01-01" },
        ],
      });
      expect(result.withdrawalRequests).toHaveLength(1);
      expect(result.withdrawalRequests[0].status).toBe(status);
    }
  });

  test("all topup statuses are accepted", () => {
    const statuses = ["pending", "succeeded", "failed"] as const;
    for (const status of statuses) {
      const result = normalizeProviderWalletMetadata({
        topupRequests: [
          { id: `t-${status}`, amount: 10, status, requestedAt: "2026-01-01" },
        ],
      });
      expect(result.topupRequests).toHaveLength(1);
      expect(result.topupRequests[0].status).toBe(status);
    }
  });
});

describe("buildWalletMetadataPatch", () => {
  test("wraps wallet metadata under wallet key", () => {
    const wallet: ProviderWalletMetadata = {
      autoWithdrawalEnabled: true,
      bankAccount: null,
      withdrawalRequests: [],
      topupRequests: [],
    };

    const patch = buildWalletMetadataPatch(null, wallet);
    expect(patch.wallet).toEqual(wallet);
  });

  test("preserves existing metadata properties", () => {
    const existing = { someOther: "data", nested: { value: true } };
    const wallet: ProviderWalletMetadata = {
      autoWithdrawalEnabled: false,
      bankAccount: null,
      withdrawalRequests: [],
      topupRequests: [],
    };

    const patch = buildWalletMetadataPatch(existing, wallet) as Record<
      string,
      unknown
    >;
    expect(patch.someOther).toBe("data");
    expect(patch.nested).toEqual({ value: true });
    expect(patch.wallet).toEqual(wallet);
  });

  test("handles non-object current metadata", () => {
    const wallet: ProviderWalletMetadata = {
      autoWithdrawalEnabled: false,
      bankAccount: null,
      withdrawalRequests: [],
      topupRequests: [],
    };

    const patch = buildWalletMetadataPatch("not-an-object", wallet);
    expect(patch.wallet).toEqual(wallet);
  });
});
