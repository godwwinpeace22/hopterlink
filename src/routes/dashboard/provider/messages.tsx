import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const Messages = lazy(() =>
  import("@/app/components/pages/Messages").then((m) => ({
    default: m.Messages,
  })),
);

export const Route = createFileRoute("/dashboard/provider/messages")({
  component: () => (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <Messages />
    </Suspense>
  ),
});
