import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const DashboardProfile = lazy(() =>
  import("@/app/components/pages/shared/DashboardProfile").then((m) => ({
    default: m.DashboardProfile,
  })),
);

export const Route = createFileRoute("/dashboard/client/profile/")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <DashboardProfile />
    </Suspense>
  ),
});
