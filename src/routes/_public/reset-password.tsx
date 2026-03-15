import { createFileRoute } from "@tanstack/react-router";
import { ResetPassword } from "@/app/components/pages/ResetPassword";

export const Route = createFileRoute("/_public/reset-password")({
  component: ResetPassword,
});
