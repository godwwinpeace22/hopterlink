import { createFileRoute } from "@tanstack/react-router";
import { About } from "@/app/components/pages/about";

export const Route = createFileRoute("/_public/about")({
  component: About,
});
