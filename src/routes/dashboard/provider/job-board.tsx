import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const JobBoard = lazy(() =>
  import("@/app/components/pages/JobBoard").then((m) => ({
    default: m.JobBoard,
  })),
);

export const Route = createFileRoute("/dashboard/provider/job-board")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <JobBoard />
    </Suspense>
  ),
});
