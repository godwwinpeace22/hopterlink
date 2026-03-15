import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminDisputes = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminDisputes").then((m) => ({
    default: m.AdminDisputes,
  })),
);

export const Route = createFileRoute("/dashboard/admin/disputes")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AdminDisputes />
    </Suspense>
  ),
});
