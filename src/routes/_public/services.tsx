import { createFileRoute } from "@tanstack/react-router";
import { Services } from "@/app/components/pages/Services";

export const Route = createFileRoute("/_public/services")({
  component: Services,
});
