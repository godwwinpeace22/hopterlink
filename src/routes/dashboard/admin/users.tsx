import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminUsers = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminUsers").then((m) => ({
    default: m.AdminUsers,
  })),
);

export const Route = createFileRoute("/dashboard/admin/users")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <AdminUsers />
    </Suspense>
  ),
});
