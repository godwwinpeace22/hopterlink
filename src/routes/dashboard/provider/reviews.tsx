import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProviderReviews = lazy(() =>
  import("@/app/components/pages/provider/sections/ProviderReviews").then(
    (m) => ({
      default: m.ProviderReviews,
    }),
  ),
);

export const Route = createFileRoute("/dashboard/provider/reviews")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderReviews />
    </Suspense>
  ),
});
