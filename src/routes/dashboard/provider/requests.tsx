import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/provider/requests")({
  component: () => <Navigate to="/dashboard/provider/jobs" replace />,
});
