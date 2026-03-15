import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ClientJobDetails = lazy(() =>
  import("@/app/components/pages/JobDetails").then((m) => ({
    default: m.JobDetails,
  })),
);

export const Route = createFileRoute("/dashboard/client/job/$jobId")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ClientJobDetails />
    </Suspense>
  ),
});
