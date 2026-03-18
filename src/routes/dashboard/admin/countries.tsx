import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const AdminCountries = lazy(() =>
  import("@/app/components/pages/admin/sections/AdminCountries").then((m) => ({
    default: m.AdminCountries,
  })),
);

export const Route = createFileRoute("/dashboard/admin/countries")({
  component: () => (
    <Suspense
      fallback={<div className="p-6">Loading countries settings...</div>}
    >
      <AdminCountries />
    </Suspense>
  ),
});
