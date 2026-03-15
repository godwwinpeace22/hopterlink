import { createFileRoute } from "@tanstack/react-router";
import { ProviderProfile } from "@/app/components/pages/ProviderProfilePage";

export const Route = createFileRoute("/_public/providers/$providerId")({
  component: ProviderProfile,
});
