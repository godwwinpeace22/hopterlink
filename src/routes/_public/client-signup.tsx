import { createFileRoute } from "@tanstack/react-router";
import { ClientSignup } from "@/app/components/pages/ClientSignup";

export const Route = createFileRoute("/_public/client-signup")({
  component: ClientSignup,
});
