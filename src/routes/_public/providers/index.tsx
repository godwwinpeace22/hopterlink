import { createFileRoute } from "@tanstack/react-router";
import { Providers } from "@/app/components/pages/Providers";

export const Route = createFileRoute("/_public/providers/")({
  component: Providers,
});
