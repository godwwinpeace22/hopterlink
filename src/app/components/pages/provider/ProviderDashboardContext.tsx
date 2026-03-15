import { createContext, useContext } from "react";

export type ProviderDashboardSection =
  | "overview"
  | "job-board"
  | "jobs"
  | "calendar"
  | "wallet"
  | "profile"
  | "messages"
  | "notifications"
  | "reviews"
  | "settings";

export type JobRequest = {
  id: string;
  jobId: string;
  clientId: string;
  client: string;
  service: string;
  description: string;
  date: string;
  timePreference: string;
  budget: string;
  address: string;
  urgency: "urgent" | "flexible";
  clientRating: number;
  postedTime: string;
};

export type AcceptedJob = {
  id: string;
  jobId?: string | null;
  clientId: string;
  client: string;
  service: string;
  date: string;
  time: string;
  status: "upcoming" | "in-progress" | "completed";
  price: number;
  address: string;
  description: string;
};

export type ProviderReview = {
  id: string;
  reviewerId: string;
  client: string;
  rating: number;
  date: string;
  service: string;
  comment: string;
  response?: string | null;
  responseAt?: string | null;
  verified?: boolean;
};

export type ProviderTransaction = {
  id: string;
  date: string;
  client: string;
  service: string;
  amount: number;
  status: string;
};

export type ProviderQuote = {
  id: string;
  jobId: string;
  jobTitle: string;
  category: string;
  clientId: string;
  clientName: string;
  status: string;
  bookingId?: string | null;
  bookingStatus?: string | null;
  amount: number;
  timeline: string;
  message: string;
  createdAt: string;
  budget: string;
  location: string;
};

export type ProviderData = {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  rating: number;
  totalReviews: number;
  completedJobs: number;
  activeJobs: number;
  pendingRequests: number;
  earnings: {
    thisMonth: number;
    lastMonth: number;
    total: number;
    pending: number;
  };
  services: string[];
  avatar: string;
  bio: string;
  verification: {
    emailVerified: boolean;
    idUploaded: boolean;
    insuranceUploaded: boolean;
    certificationsUploaded: boolean;
    profileComplete: boolean;
    paymentSetup: boolean;
    backgroundCheckComplete: boolean;
    isFullyVerified: boolean;
  };
};

export type ProviderDashboardContextValue = {
  providerData: ProviderData;
  jobRequests: JobRequest[];
  acceptedJobs: AcceptedJob[];
  providerQuotes: ProviderQuote[];
  transactions: ProviderTransaction[];
  reviews: ProviderReview[];
  quoteDialogOpen: boolean;
  setQuoteDialogOpen: (open: boolean) => void;
  selectedJobRequest: JobRequest | null;
  setSelectedJobRequest: (request: JobRequest | null) => void;
  quoteAmount: string;
  setQuoteAmount: (amount: string) => void;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  handleSubmitQuote: () => Promise<void>;
  handleAcceptRequest: (requestId: string) => Promise<void>;
  handleDeclineRequest: (requestId: string) => Promise<void>;
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  handleStartJob: (jobId: string) => Promise<void>;
  handleCompleteJob: (jobId: string) => Promise<void>;
  responseDialogOpen: boolean;
  setResponseDialogOpen: (open: boolean) => void;
  selectedReview: ProviderReview | null;
  setSelectedReview: (review: ProviderReview | null) => void;
  responseText: string;
  setResponseText: (text: string) => void;
  handleSubmitResponse: () => Promise<void>;
  isVerificationReady: boolean;
  isPendingReview: boolean;
  needsOnboarding: boolean;
  verificationStatus:
    | "loading"
    | "not_started"
    | "pending"
    | "approved"
    | "rejected"
    | "expired";
  lockedSections: ProviderDashboardSection[];
  navigateToSection: (section: ProviderDashboardSection) => void;
};

const ProviderDashboardContext =
  createContext<ProviderDashboardContextValue | null>(null);

export const ProviderDashboardProvider = ProviderDashboardContext.Provider;

export const useProviderDashboard = () => {
  const context = useContext(ProviderDashboardContext);
  if (!context) {
    throw new Error(
      "useProviderDashboard must be used within ProviderDashboardProvider",
    );
  }
  return context;
};
