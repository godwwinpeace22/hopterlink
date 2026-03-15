import { createFileRoute } from "@tanstack/react-router";
import { HowItWorksPage } from "@/app/components/pages/howItWorks";

export const Route = createFileRoute("/_public/how-it-works")({
  component: HowItWorksPage,
});
