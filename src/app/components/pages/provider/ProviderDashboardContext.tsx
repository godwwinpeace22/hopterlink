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

export type ProviderDashboardContextValue = any;

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
