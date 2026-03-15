import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RequireAuth } from "@/app/routes/guards";

const ProviderOnboarding = lazy(() =>
  import("@/app/components/pages/ProviderOnboarding").then((m) => ({
    default: m.ProviderOnboarding,
  })),
);

export const Route = createFileRoute("/provider/onboarding")({
  component: () => (
    <RequireAuth access="provider-membership">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-gray-600">Loading...</div>
          </div>
        }
      >
        <ProviderOnboarding />
      </Suspense>
    </RequireAuth>
  ),
});
