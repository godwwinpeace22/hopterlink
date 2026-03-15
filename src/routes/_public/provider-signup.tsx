import { createFileRoute } from "@tanstack/react-router";
import { ProviderSignup } from "@/app/components/pages/ProviderSignup";

export const Route = createFileRoute("/_public/provider-signup")({
  component: ProviderSignup,
});
