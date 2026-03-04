export type WithdrawalStatus =
  | "requested"
  | "queued"
  | "processing"
  | "paid"
  | "failed"
  | "cancelled";

export type TopupStatus = "pending" | "succeeded" | "failed";

export type ProviderWalletTransactionType =
  | "earning"
  | "withdrawal"
  | "topup"
  | "fee"
  | "adjustment";

export type ProviderWalletTransaction = {
  id: string;
  amount: number;
  type: ProviderWalletTransactionType;
  status: string;
  description: string;
  createdAt: string;
};

export type WithdrawalRequest = {
  id: string;
  amount: number;
  status: WithdrawalStatus;
  requestedAt: string;
  payoutReference?: string;
  note?: string;
};

export type TopupRequest = {
  id: string;
  amount: number;
  status: TopupStatus;
  requestedAt: string;
  provider: "stripe";
  reference?: string;
};

export type BankAccountDetails = {
  accountName: string;
  bankName: string;
  institutionNumber: string;
  transitNumber: string;
  accountNumber: string;
  country: string;
  currency: string;
  verified: boolean;
};

export type ProviderWalletMetadata = {
  autoWithdrawalEnabled: boolean;
  bankAccount: BankAccountDetails | null;
  withdrawalRequests: WithdrawalRequest[];
  topupRequests: TopupRequest[];
};

const defaultMetadata: ProviderWalletMetadata = {
  autoWithdrawalEnabled: false,
  bankAccount: null,
  withdrawalRequests: [],
  topupRequests: [],
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const normalizeWithdrawal = (value: unknown): WithdrawalRequest | null => {
  if (!isObject(value)) return null;

  const id = typeof value.id === "string" ? value.id : null;
  const amount =
    typeof value.amount === "number" ? value.amount : Number(value.amount);
  const status =
    value.status === "requested" ||
    value.status === "queued" ||
    value.status === "processing" ||
    value.status === "paid" ||
    value.status === "failed" ||
    value.status === "cancelled"
      ? value.status
      : null;
  const requestedAt =
    typeof value.requestedAt === "string"
      ? value.requestedAt
      : typeof value.requested_at === "string"
        ? value.requested_at
        : null;

  if (!id || !Number.isFinite(amount) || !status || !requestedAt) {
    return null;
  }

  return {
    id,
    amount,
    status,
    requestedAt,
    payoutReference:
      typeof value.payoutReference === "string"
        ? value.payoutReference
        : undefined,
    note: typeof value.note === "string" ? value.note : undefined,
  };
};

const normalizeTopup = (value: unknown): TopupRequest | null => {
  if (!isObject(value)) return null;

  const id = typeof value.id === "string" ? value.id : null;
  const amount =
    typeof value.amount === "number" ? value.amount : Number(value.amount);
  const status =
    value.status === "pending" ||
    value.status === "succeeded" ||
    value.status === "failed"
      ? value.status
      : null;
  const requestedAt =
    typeof value.requestedAt === "string"
      ? value.requestedAt
      : typeof value.requested_at === "string"
        ? value.requested_at
        : null;

  if (!id || !Number.isFinite(amount) || !status || !requestedAt) {
    return null;
  }

  return {
    id,
    amount,
    status,
    requestedAt,
    provider: "stripe",
    reference:
      typeof value.reference === "string" ? value.reference : undefined,
  };
};

const normalizeBankAccount = (value: unknown): BankAccountDetails | null => {
  if (!isObject(value)) return null;

  const accountName =
    typeof value.accountName === "string" ? value.accountName.trim() : "";
  const bankName =
    typeof value.bankName === "string" ? value.bankName.trim() : "";
  const institutionNumber =
    typeof value.institutionNumber === "string"
      ? value.institutionNumber.trim()
      : typeof value.routingNumberLast4 === "string"
        ? value.routingNumberLast4.trim()
        : "";
  const transitNumber =
    typeof value.transitNumber === "string" ? value.transitNumber.trim() : "";
  const accountNumber =
    typeof value.accountNumber === "string"
      ? value.accountNumber.trim()
      : typeof value.accountNumberLast4 === "string"
        ? value.accountNumberLast4.trim()
        : "";

  if (
    !accountName ||
    !bankName ||
    !institutionNumber ||
    !transitNumber ||
    !accountNumber
  ) {
    return null;
  }

  return {
    accountName,
    bankName,
    institutionNumber,
    transitNumber,
    accountNumber,
    country: typeof value.country === "string" ? value.country : "CA",
    currency: typeof value.currency === "string" ? value.currency : "CAD",
    verified: Boolean(value.verified),
  };
};

export const normalizeProviderWalletMetadata = (
  metadata: unknown,
): ProviderWalletMetadata => {
  if (!isObject(metadata)) {
    return defaultMetadata;
  }

  const walletMetadata = isObject(metadata.wallet) ? metadata.wallet : metadata;

  const withdrawals = Array.isArray(walletMetadata.withdrawalRequests)
    ? walletMetadata.withdrawalRequests
        .map(normalizeWithdrawal)
        .filter((value): value is WithdrawalRequest => Boolean(value))
    : [];

  const topups = Array.isArray(walletMetadata.topupRequests)
    ? walletMetadata.topupRequests
        .map(normalizeTopup)
        .filter((value): value is TopupRequest => Boolean(value))
    : [];

  return {
    autoWithdrawalEnabled: Boolean(walletMetadata.autoWithdrawalEnabled),
    bankAccount: normalizeBankAccount(walletMetadata.bankAccount),
    withdrawalRequests: withdrawals,
    topupRequests: topups,
  };
};

export const buildWalletMetadataPatch = (
  currentMetadata: unknown,
  wallet: ProviderWalletMetadata,
) => {
  const metadata = isObject(currentMetadata) ? { ...currentMetadata } : {};

  return {
    ...metadata,
    wallet: {
      autoWithdrawalEnabled: wallet.autoWithdrawalEnabled,
      bankAccount: wallet.bankAccount,
      withdrawalRequests: wallet.withdrawalRequests,
      topupRequests: wallet.topupRequests,
    },
  };
};
