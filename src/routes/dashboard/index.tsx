import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth, DashboardRouter } from "@/app/routes/guards";

export const Route = createFileRoute("/dashboard/")({
  component: () => (
    <RequireAuth>
      <DashboardRouter />
    </RequireAuth>
  ),
});
