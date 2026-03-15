import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ClientBrowse = lazy(() =>
  import("@/app/components/pages/client/sections/ClientBrowse").then((m) => ({
    default: m.ClientBrowse,
  })),
);

export const Route = createFileRoute("/dashboard/client/browse")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ClientBrowse />
    </Suspense>
  ),
});
