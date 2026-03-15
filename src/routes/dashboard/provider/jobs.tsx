import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProviderJobs = lazy(() =>
  import("@/app/components/pages/provider/sections/ProviderJobs").then((m) => ({
    default: m.ProviderJobs,
  })),
);

export const Route = createFileRoute("/dashboard/provider/jobs")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderJobs />
    </Suspense>
  ),
});
