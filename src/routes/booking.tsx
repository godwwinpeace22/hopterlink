import { createFileRoute, Navigate } from "@tanstack/react-router";
import { RequireAuth } from "@/app/routes/guards";

export const Route = createFileRoute("/booking")({
  component: () => (
    <RequireAuth access="client">
      <Navigate to="/dashboard/client/booking" replace />
    </RequireAuth>
  ),
});
