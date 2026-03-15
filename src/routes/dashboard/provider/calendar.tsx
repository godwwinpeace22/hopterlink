import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProviderCalendar = lazy(() =>
  import("@/app/components/pages/provider/sections/ProviderCalendar").then(
    (m) => ({
      default: m.ProviderCalendar,
    }),
  ),
);

export const Route = createFileRoute("/dashboard/provider/calendar")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderCalendar />
    </Suspense>
  ),
});
