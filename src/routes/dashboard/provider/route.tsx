import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RequireAuth } from "@/app/routes/guards";

const ProviderDashboard = lazy(() =>
  import("@/app/components/pages/ProviderDashboard").then((m) => ({
    default: m.ProviderDashboard,
  })),
);

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/provider")({
  component: () => (
    <RequireAuth access="provider">
      <Suspense fallback={<RouteFallback />}>
        <ProviderDashboard />
      </Suspense>
    </RequireAuth>
  ),
});
