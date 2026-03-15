import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ClientSettings = lazy(() =>
  import("@/app/components/pages/client/sections/ClientSettings").then((m) => ({
    default: m.ClientSettings,
  })),
);

export const Route = createFileRoute("/dashboard/client/settings")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ClientSettings />
    </Suspense>
  ),
});
