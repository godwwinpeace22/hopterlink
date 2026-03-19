import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminJobs = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminJobs").then((m) => ({
    default: m.AdminJobs,
  })),
);

export const Route = createFileRoute("/dashboard/admin/jobs")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AdminJobs />
    </Suspense>
  ),
});
