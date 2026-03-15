import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RequireAuth } from "@/app/routes/guards";

const AdminDashboardLayout = lazy(() =>
  import("@/app/components/pages/admin/AdminDashboardLayout").then((m) => ({
    default: m.AdminDashboardLayout,
  })),
);

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-gray-600">Loading...</div>
    </div>
  );
}

export const Route = createFileRoute("/dashboard/admin")({
  component: () => (
    <RequireAuth access="admin">
      <Suspense fallback={<RouteFallback />}>
        <AdminDashboardLayout />
      </Suspense>
    </RequireAuth>
  ),
});
