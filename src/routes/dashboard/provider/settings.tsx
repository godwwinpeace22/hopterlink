import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProviderSettings = lazy(() =>
  import("@/app/components/pages/provider/sections/ProviderSettings").then(
    (m) => ({
      default: m.ProviderSettings,
    }),
  ),
);

export const Route = createFileRoute("/dashboard/provider/settings")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderSettings />
    </Suspense>
  ),
});
