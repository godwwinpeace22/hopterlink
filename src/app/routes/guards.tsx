import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { paths } from "./paths";

type RouteAccess =
  | "authenticated"
  | "client"
  | "provider"
  | "provider-membership";

function LoadingState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-600">{message}</div>
    </div>
  );
}

export function RequireAuth({
  children,
  access = "authenticated",
}: {
  children: React.ReactNode;
  access?: RouteAccess;
}) {
  const { isLoading, user, approvedRoles, activeRole, memberships } = useAuth();

  if (isLoading) {
    return <LoadingState message="Loading..." />;
  }

  if (!user) {
    return <Navigate to={paths.auth.signIn} replace />;
  }

  if (access === "provider") {
    if (!approvedRoles.includes("provider") || activeRole !== "provider") {
      return <Navigate to={paths.dashboard.root} replace />;
    }
  }

  if (access === "client") {
    if (!approvedRoles.includes("client") || activeRole !== "client") {
      return <Navigate to={paths.dashboard.root} replace />;
    }
  }

  if (access === "provider-membership") {
    const hasProviderMembership = memberships.some(
      (membership) => membership.role === "provider",
    );
    if (!hasProviderMembership && !approvedRoles.includes("provider")) {
      return <Navigate to={paths.dashboard.root} replace />;
    }
  }

  return <>{children}</>;
}

export function DashboardRouter() {
  const { memberships, activeRole, approvedRoles } = useAuth();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const section = params.get("section");
  const jobId = params.get("jobId");

  if (activeRole === "provider") {
    if (section) {
      const providerSectionPath =
        paths.dashboard.resolveProviderSection(section);
      if (providerSectionPath) {
        return <Navigate to={providerSectionPath} replace />;
      }

      return <Navigate to={paths.dashboard.provider.root} replace />;
    }

    return <Navigate to={paths.dashboard.provider.root} replace />;
  }

  if (activeRole === "client") {
    if (section) {
      if (section === "job-details" && jobId) {
        return <Navigate to={paths.dashboard.client.job(jobId)} replace />;
      }

      const clientSectionPath = paths.dashboard.resolveClientSection(section);
      if (clientSectionPath) {
        return <Navigate to={clientSectionPath} replace />;
      }

      return <Navigate to={paths.dashboard.client.root} replace />;
    }

    return <Navigate to={paths.dashboard.client.root} replace />;
  }

  if (approvedRoles.includes("provider")) {
    return <Navigate to={paths.dashboard.provider.root} replace />;
  }

  if (approvedRoles.includes("client")) {
    return <Navigate to={paths.dashboard.client.root} replace />;
  }

  const providerMembership = memberships.find(
    (membership) => membership.role === "provider",
  );
  if (providerMembership) {
    return <Navigate to={paths.provider.onboarding} replace />;
  }

  return <LoadingState message="Loading your dashboard..." />;
}
