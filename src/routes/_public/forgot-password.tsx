import { createFileRoute } from "@tanstack/react-router";
import { ForgotPassword } from "@/app/components/pages/ForgotPassword";

export const Route = createFileRoute("/_public/forgot-password")({
  component: ForgotPassword,
});
