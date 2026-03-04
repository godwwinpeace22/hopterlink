import { lazy, Suspense } from "react";
import { Route, useLocation } from "react-router-dom";
import { RequireAuth } from "./guards";
import { paths } from "./paths";

const ClientDashboardLayout = lazy(() =>
  import("../components/pages/client/ClientDashboardLayout").then((module) => ({
    default: module.ClientDashboardLayout,
  })),
);

const ClientOverview = lazy(() =>
  import("../components/pages/client/sections/ClientOverview").then(
    (module) => ({
      default: module.ClientOverview,
    }),
  ),
);

const ClientBrowse = lazy(() =>
  import("../components/pages/client/sections/ClientBrowse").then((module) => ({
    default: module.ClientBrowse,
  })),
);

const ClientBookings = lazy(() =>
  import("../components/pages/client/sections/ClientBookings").then(
    (module) => ({
      default: module.ClientBookings,
    }),
  ),
);

const ClientReviews = lazy(() =>
  import("../components/pages/client/sections/ClientReviews").then(
    (module) => ({
      default: module.ClientReviews,
    }),
  ),
);

const ClientWallet = lazy(() =>
  import("../components/pages/client/sections/ClientWallet").then((module) => ({
    default: module.ClientWallet,
  })),
);

const ClientMyJobs = lazy(() =>
  import("../components/pages/client/sections/ClientMyJobs").then((module) => ({
    default: module.ClientMyJobs,
  })),
);

const ClientJobDetails = lazy(() =>
  import("../components/pages/client/sections/ClientJobDetails").then(
    (module) => ({
      default: module.ClientJobDetails,
    }),
  ),
);

const ClientPostJob = lazy(() =>
  import("../components/pages/client/sections/ClientPostJob").then(
    (module) => ({
      default: module.ClientPostJob,
    }),
  ),
);

const ClientMessages = lazy(() =>
  import("../components/pages/client/sections/ClientMessages").then(
    (module) => ({
      default: module.ClientMessages,
    }),
  ),
);

const ClientNotifications = lazy(() =>
  import("../components/pages/client/sections/ClientNotifications").then(
    (module) => ({
      default: module.ClientNotifications,
    }),
  ),
);

const ClientProfile = lazy(() =>
  import("../components/pages/client/sections/ClientProfile").then(
    (module) => ({
      default: module.ClientProfile,
    }),
  ),
);

const PublicProfile = lazy(() =>
  import("../components/pages/PublicProfile").then((module) => ({
    default: module.PublicProfile,
  })),
);

const ProviderSearch = lazy(() =>
  import("../components/pages/ProviderSearch").then((module) => ({
    default: module.ProviderSearch,
  })),
);

const ProviderProfilePage = lazy(() =>
  import("../components/pages/ProviderProfile").then((module) => ({
    default: module.ProviderProfile,
  })),
);

const BookingWizardPage = lazy(() =>
  import("../components/pages/BookingWizard").then((module) => ({
    default: module.BookingWizard,
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

function ClientProviderProfileRoute() {
  const location = useLocation();
  const pageData = location.state as unknown;

  return (
    <Suspended>
      <ProviderProfilePage data={pageData} />
    </Suspended>
  );
}

function ClientBookingWizardRoute() {
  const location = useLocation();
  const pageData = location.state as unknown;

  return (
    <Suspended>
      <BookingWizardPage data={pageData} />
    </Suspended>
  );
}

export function ClientRoutes() {
  return (
    <Route
      path={paths.dashboard.client.root}
      element={
        <RequireAuth access="client">
          <Suspended>
            <ClientDashboardLayout />
          </Suspended>
        </RequireAuth>
      }
    >
      <Route
        index
        element={
          <Suspended>
            <ClientOverview />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.overview}
        element={
          <Suspended>
            <ClientOverview />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.browse}
        element={
          <Suspended>
            <ClientBrowse />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.providers}
        element={
          <Suspended>
            <ProviderSearch />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.providerProfile}
        element={<ClientProviderProfileRoute />}
      />
      <Route
        path={paths.dashboard.client.sections.booking}
        element={<ClientBookingWizardRoute />}
      />
      <Route
        path={paths.dashboard.client.sections.bookings}
        element={
          <Suspended>
            <ClientBookings />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.reviews}
        element={
          <Suspended>
            <ClientReviews />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.wallet}
        element={
          <Suspended>
            <ClientWallet />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.myJobs}
        element={
          <Suspended>
            <ClientMyJobs />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.jobDetails}
        element={
          <Suspended>
            <ClientJobDetails />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.postJob}
        element={
          <Suspended>
            <ClientPostJob />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.messages}
        element={
          <Suspended>
            <ClientMessages />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.notifications}
        element={
          <Suspended>
            <ClientNotifications />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.profile}
        element={
          <Suspended>
            <ClientProfile />
          </Suspended>
        }
      />
      <Route
        path={paths.dashboard.client.sections.profileUser}
        element={
          <Suspended>
            <PublicProfile />
          </Suspended>
        }
      />
    </Route>
  );
}
