import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminRevenue = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminRevenue").then((m) => ({
    default: m.AdminRevenue,
  })),
);

export const Route = createFileRoute("/dashboard/admin/revenue")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AdminRevenue />
    </Suspense>
  ),
});
