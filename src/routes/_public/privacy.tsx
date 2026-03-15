import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/app/components/pages/PrivacyPage";

export const Route = createFileRoute("/_public/privacy")({
  component: PrivacyPage,
});
