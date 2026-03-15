import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/app/components/pages/TermsPage";

export const Route = createFileRoute("/_public/terms")({
  component: TermsPage,
});
