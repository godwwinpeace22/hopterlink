import { createFileRoute } from "@tanstack/react-router";
import { EmailVerification } from "@/app/components/pages/EmailVerification";

export const Route = createFileRoute("/_public/verify-email")({
  component: EmailVerification,
});
