import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ClientBookings = lazy(() =>
  import("@/app/components/pages/client/sections/ClientBookings").then((m) => ({
    default: m.ClientBookings,
  })),
);

export const Route = createFileRoute("/dashboard/client/bookings")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ClientBookings />
    </Suspense>
  ),
});
