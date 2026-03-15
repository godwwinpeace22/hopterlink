import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ProviderWallet = lazy(() =>
  import("@/app/components/pages/provider/sections/ProviderWallet").then(
    (m) => ({
      default: m.ProviderWallet,
    }),
  ),
);

export const Route = createFileRoute("/dashboard/provider/wallet")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderWallet />
    </Suspense>
  ),
});
