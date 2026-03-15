import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { useLocation } from "@/lib/router";

const BookingWizard = lazy(() =>
  import("@/app/components/pages/BookingWizard").then((m) => ({
    default: m.BookingWizard,
  })),
);

function ClientBookingWizardRoute() {
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
      <BookingWizard data={pageData} />
    </Suspense>
  );
}

export const Route = createFileRoute("/dashboard/client/booking")({
  component: ClientBookingWizardRoute,
});
