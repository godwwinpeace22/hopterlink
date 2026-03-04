export const WALLET_CONFIG = {
  currency: "CAD",
  timezone: "America/Toronto",
  payoutDayLabel: "Friday",
  payoutDayIndex: 5,
  minimumWithdrawalAmount: 50,
  stripeTopupEnabled: true,
} as const;

export const WALLET_STATUS_LABELS = {
  requested: "Requested",
  queued: "Queued",
  processing: "Processing",
  paid: "Paid",
  failed: "Failed",
  cancelled: "Cancelled",
} as const;

export const TOPUP_STATUS_LABELS = {
  pending: "Pending",
  succeeded: "Succeeded",
  failed: "Failed",
} as const;
