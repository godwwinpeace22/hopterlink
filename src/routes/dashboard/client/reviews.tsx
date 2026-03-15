import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ClientReviews = lazy(() =>
  import("@/app/components/pages/client/sections/ClientReviews").then((m) => ({
    default: m.ClientReviews,
  })),
);

export const Route = createFileRoute("/dashboard/client/reviews")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ClientReviews />
    </Suspense>
  ),
});
