import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ClientRoutes } from "./clientRoutes";
import { DashboardRouter, RequireAuth } from "./guards";
import { paths } from "./paths";
import { ProviderRoutes } from "./providerRoutes";
import { PublicRoutes } from "./publicRoutes";

const PublicProfile = lazy(() =>
  import("../components/pages/PublicProfile").then((module) => ({
    default: module.PublicProfile,
  })),
);

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

function Suspended({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

function LegacyBookingRedirect() {
  const location = useLocation();

  return (
    <Navigate
      to={paths.dashboard.client.absolute("booking")}
      replace
      state={location.state}
    />
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {PublicRoutes()}

      <Route
        path={paths.dashboard.root}
        element={
          <RequireAuth>
            <DashboardRouter />
          </RequireAuth>
        }
      />

      {ClientRoutes()}
      {ProviderRoutes()}

      <Route
        path={paths.profile.route}
        element={
          <RequireAuth>
            <Suspended>
              <PublicProfile />
            </Suspended>
          </RequireAuth>
        }
      />

      <Route
        path="/booking"
        element={
          <RequireAuth access="client">
            <LegacyBookingRedirect />
          </RequireAuth>
        }
      />

      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  );
}
