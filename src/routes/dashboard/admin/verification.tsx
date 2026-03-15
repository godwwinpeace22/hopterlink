import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminVerification = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminVerification").then(
    (m) => ({
      default: m.AdminVerification,
    }),
  ),
);

export const Route = createFileRoute("/dashboard/admin/verification")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AdminVerification />
    </Suspense>
  ),
});
