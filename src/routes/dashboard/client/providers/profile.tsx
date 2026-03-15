import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useLocation } from "@/lib/router";

const ProviderProfile = lazy(() =>
  import("@/app/components/pages/ProviderProfile").then((m) => ({
    default: m.ProviderProfile,
  })),
);

function ClientProviderProfileRoute() {
  const location = useLocation();
  const pageData = (location as any).state as unknown;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ProviderProfile data={pageData} />
    </Suspense>
  );
}

export const Route = createFileRoute("/dashboard/client/providers/profile")({
  component: ClientProviderProfileRoute,
});
