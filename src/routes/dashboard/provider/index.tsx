import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProviderOverview = lazy(() =>
  import("@/app/components/pages/provider/sections/ProviderOverview").then(
    (m) => ({
      default: m.ProviderOverview,
    }),
  ),
);

export const Route = createFileRoute("/dashboard/provider/")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderOverview />
    </Suspense>
  ),
});
