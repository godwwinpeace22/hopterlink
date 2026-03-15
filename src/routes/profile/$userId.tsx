import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { RequireAuth } from "@/app/routes/guards";

const PublicProfile = lazy(() =>
  import("@/app/components/pages/PublicProfile").then((m) => ({
    default: m.PublicProfile,
  })),
);

export const Route = createFileRoute("/profile/$userId")({
  component: () => (
    <RequireAuth>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="text-gray-600">Loading...</div>
          </div>
        }
      >
        <PublicProfile />
      </Suspense>
    </RequireAuth>
  ),
});
