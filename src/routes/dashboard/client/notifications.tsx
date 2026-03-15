import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Notifications = lazy(() =>
  import("@/app/components/pages/Notifications").then((m) => ({
    default: m.Notifications,
  })),
);

export const Route = createFileRoute("/dashboard/client/notifications")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <Notifications />
    </Suspense>
  ),
});
