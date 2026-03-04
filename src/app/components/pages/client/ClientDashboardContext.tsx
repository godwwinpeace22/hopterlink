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

export type ClientDashboardContextValue = any;

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
