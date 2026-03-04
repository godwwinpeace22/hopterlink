import { lazy, Suspense } from "react";
import { Navigate, Route } from "react-router-dom";
import { RequireAuth } from "./guards";
import { paths } from "./paths";

const ProviderOnboarding = lazy(() =>
  import("../components/pages/ProviderOnboarding").then((module) => ({
    default: module.ProviderOnboarding,
  })),
);

const ProviderVerification = lazy(() =>
  import("../components/pages/ProviderVerification").then((module) => ({
    default: module.ProviderVerification,
  })),
);

const ProviderDashboard = lazy(() =>
  import("../components/pages/ProviderDashboard").then((module) => ({
    default: module.ProviderDashboard,
  })),
);

const ProviderOverview = lazy(() =>
  import("../components/pages/provider/sections/ProviderOverview").then(
    (module) => ({
      default: module.ProviderOverview,
    }),
  ),
);

const ProviderJobBoard = lazy(() =>
  import("../components/pages/provider/sections/ProviderJobBoard").then(
    (module) => ({
      default: module.ProviderJobBoard,
    }),
  ),
);

const ProviderJobs = lazy(() =>
  import("../components/pages/provider/sections/ProviderJobs").then(
    (module) => ({
      default: module.ProviderJobs,
    }),
  ),
);

const ProviderJobDetails = lazy(() =>
  import("../components/pages/provider/sections/ProviderJobDetails").then(
    (module) => ({
      default: module.ProviderJobDetails,
    }),
  ),
);

const ProviderCalendar = lazy(() =>
  import("../components/pages/provider/sections/ProviderCalendar").then(
    (module) => ({
      default: module.ProviderCalendar,
    }),
  ),
);

const ProviderWallet = lazy(() =>
  import("../components/pages/provider/sections/ProviderWallet").then(
    (module) => ({
      default: module.ProviderWallet,
    }),
  ),
);

const ProviderProfile = lazy(() =>
  import("../components/pages/provider/sections/ProviderProfile").then(
    (module) => ({
      default: module.ProviderProfile,
    }),
  ),
);

const ProviderMessages = lazy(() =>
  import("../components/pages/provider/sections/ProviderMessages").then(
    (module) => ({
      default: module.ProviderMessages,
    }),
  ),
);

const ProviderNotifications = lazy(() =>
  import("../components/pages/provider/sections/ProviderNotifications").then(
    (module) => ({
      default: module.ProviderNotifications,
    }),
  ),
);

const ProviderReviews = lazy(() =>
  import("../components/pages/provider/sections/ProviderReviews").then(
    (module) => ({
      default: module.ProviderReviews,
    }),
  ),
);

const ProviderSettings = lazy(() =>
  import("../components/pages/provider/sections/ProviderSettings").then(
    (module) => ({
      default: module.ProviderSettings,
    }),
  ),
);

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

export function ProviderRoutes() {
  return (
    <>
      <Route
        path={paths.dashboard.provider.root}
        element={
          <RequireAuth access="provider">
            <Suspended>
              <ProviderDashboard />
            </Suspended>
          </RequireAuth>
        }
      >
        <Route
          index
          element={
            <Suspended>
              <ProviderOverview />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.overview}
          element={
            <Suspended>
              <ProviderOverview />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.requests}
          element={
            <Navigate to={paths.dashboard.provider.absolute("jobs")} replace />
          }
        />
        <Route
          path={paths.dashboard.provider.sections.jobBoard}
          element={
            <Suspended>
              <ProviderJobBoard />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.jobs}
          element={
            <Suspended>
              <ProviderJobs />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.jobDetails}
          element={
            <Suspended>
              <ProviderJobDetails />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.calendar}
          element={
            <Suspended>
              <ProviderCalendar />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.wallet}
          element={
            <Suspended>
              <ProviderWallet />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.profile}
          element={
            <Suspended>
              <ProviderProfile />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.profileUser}
          element={
            <Suspended>
              <PublicProfile />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.messages}
          element={
            <Suspended>
              <ProviderMessages />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.notifications}
          element={
            <Suspended>
              <ProviderNotifications />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.reviews}
          element={
            <Suspended>
              <ProviderReviews />
            </Suspended>
          }
        />
        <Route
          path={paths.dashboard.provider.sections.settings}
          element={
            <Suspended>
              <ProviderSettings />
            </Suspended>
          }
        />
      </Route>

      <Route
        path={paths.provider.onboarding}
        element={
          <RequireAuth access="provider-membership">
            <Suspended>
              <ProviderOnboarding />
            </Suspended>
          </RequireAuth>
        }
      />

      <Route
        path={paths.provider.verification}
        element={
          <RequireAuth access="provider">
            <Suspended>
              <ProviderVerification />
            </Suspended>
          </RequireAuth>
        }
      />
    </>
  );
}
