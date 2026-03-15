import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const ClientWallet = lazy(() =>
  import("@/app/components/pages/client/sections/ClientWallet").then((m) => ({
    default: m.ClientWallet,
  })),
);

export const Route = createFileRoute("/dashboard/client/wallet")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ClientWallet />
    </Suspense>
  ),
});
