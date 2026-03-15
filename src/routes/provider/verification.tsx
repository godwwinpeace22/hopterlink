import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RequireAuth } from "@/app/routes/guards";

const ProviderVerification = lazy(() =>
  import("@/app/components/pages/ProviderVerification").then((m) => ({
    default: m.ProviderVerification,
  })),
);

export const Route = createFileRoute("/provider/verification")({
  component: () => (
    <RequireAuth access="provider">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-gray-600">Loading...</div>
          </div>
        }
      >
        <ProviderVerification />
      </Suspense>
    </RequireAuth>
  ),
});
