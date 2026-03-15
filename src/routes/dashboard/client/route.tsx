import { createFileRoute, Outlet } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RequireAuth } from "@/app/routes/guards";

const ClientDashboardLayout = lazy(() =>
  import("@/app/components/pages/client/ClientDashboardLayout").then((m) => ({
    default: m.ClientDashboardLayout,
  })),
);

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/client")({
  component: () => (
    <RequireAuth access="client">
      <Suspense fallback={<RouteFallback />}>
        <ClientDashboardLayout />
      </Suspense>
    </RequireAuth>
  ),
});
