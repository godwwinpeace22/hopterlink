import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminServices = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminServices").then((m) => ({
    default: m.AdminServices,
  })),
);

export const Route = createFileRoute("/dashboard/admin/services")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AdminServices />
    </Suspense>
  ),
});
