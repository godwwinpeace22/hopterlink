import { useNavigate } from "@/lib/router";
import { useAuth } from "@/contexts/AuthContext";

type Page =
  | "landing"
  | "client-signup"
  | "provider-signup"
  | "signin"
  | "dashboard"
  | "provider-onboarding"
  | "provider-verification"
  | "provider-dashboard"
  | "client-dashboard"
  | "provider-search"
  | "provider-profile"
  | "booking-wizard"
  | "client-rewards"
  | "provider-rewards"
  | "rewards"
  | "post-job"
  | "job-board"
  | "job-board-demo"
  | "my-jobs"
  | "job-details"
  | "my-quotes"
  | "messages"
  | "notifications";

const pageToPath: Record<Page, string> = {
  landing: "/",
  "client-signup": "/client-signup",
  "provider-signup": "/provider-signup",
  signin: "/signin",
  dashboard: "/dashboard",
  "provider-onboarding": "/provider/onboarding",
  "provider-verification": "/provider/verification",
  "provider-dashboard": "/dashboard/provider",
  "client-dashboard": "/dashboard/client",
  "provider-search": "/providers",
  "provider-profile": "/providers/profile",
  "booking-wizard": "/booking",
  "client-rewards": "/rewards",
  "provider-rewards": "/rewards",
  rewards: "/rewards",
  "post-job": "/dashboard/client/post-job",
  "job-board": "/dashboard/provider/job-board",
  "job-board-demo": "/jobs/demo",
  "my-jobs": "/dashboard/client/my-jobs",
  "job-details": "/dashboard/client/job",
  "my-quotes": "/my-quotes",
  messages: "/messages",
  notifications: "/notifications",
};

export const useAppNavigate = () => {
  const navigate = useNavigate();
  const { activeRole } = useAuth();

  return (page: string, data?: any) => {
    if (page === "job-details") {
      const jobId = data?.jobId as string | undefined;
      if (jobId) {
        navigate(`/dashboard/client/job/${jobId}`, { state: data ?? null });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      navigate("/dashboard/client/my-jobs", { state: data ?? null });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (page === "messages") {
      const rolePath =
        activeRole === "provider"
          ? "/dashboard/provider/messages"
          : activeRole === "client"
            ? "/dashboard/client/messages"
            : "/messages";
      navigate(rolePath, { state: data ?? null });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const nextPage = page as Page;
    const nextPath = pageToPath[nextPage] ?? "/";
    navigate(nextPath, { state: data ?? null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
};
