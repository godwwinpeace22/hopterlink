import { createContext, useContext } from "react";

export type ClientDashboardSection =
  | "overview"
  | "providers"
  | "booking"
  | "bookings"
  | "reviews"
  | "wallet"
  | "my-jobs"
  | "job-details"
  | "post-job"
  | "messages"
  | "notifications"
  | "profile";

export type BookingItem = {
  id: string;
  providerId: string | null;
  provider: string;
  providerRating: number;
  service: string;
  date: string;
  time: string;
  status: "upcoming" | "in-progress" | "completed" | "cancelled";
  paymentStatus?: string | null;
  escrowStatus?: string | null;
  price: number;
  address: string;
  hasReview?: boolean;
};

export type MessageItem = {
  id: string;
  provider: string;
  message: string;
  time: string;
  unread: boolean;
};

export type ClientData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  memberSince: string;
};

export type ClientDashboardContextValue = {
  navigateToSection: (
    section: ClientDashboardSection,
    replace?: boolean,
    jobIdValue?: string | null,
  ) => void;
  unreadMessages: number;
  clientData: ClientData;
};

const ClientDashboardContext =
  createContext<ClientDashboardContextValue | null>(null);

export const ClientDashboardProvider = ClientDashboardContext.Provider;

export const useClientDashboard = () => {
  const context = useContext(ClientDashboardContext);
  if (!context) {
    throw new Error(
      "useClientDashboard must be used within ClientDashboardProvider",
    );
  }
  return context;
};
