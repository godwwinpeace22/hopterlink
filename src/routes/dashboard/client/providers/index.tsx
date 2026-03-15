import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProviderSearch = lazy(() =>
  import("@/app/components/pages/ProviderSearch").then((m) => ({
    default: m.ProviderSearch,
  })),
);

export const Route = createFileRoute("/dashboard/client/providers/")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderSearch />
    </Suspense>
  ),
});
