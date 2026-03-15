import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const MyJobs = lazy(() =>
  import("@/app/components/pages/MyJobs").then((m) => ({
    default: m.MyJobs,
  })),
);

export const Route = createFileRoute("/dashboard/client/my-jobs")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <MyJobs />
    </Suspense>
  ),
});
