import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminOverview = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminOverview").then((m) => ({
    default: m.AdminOverview,
  })),
);

export const Route = createFileRoute("/dashboard/admin/overview")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AdminOverview />
    </Suspense>
  ),
});
