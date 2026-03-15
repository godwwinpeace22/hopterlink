import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@/app/components/pages/SignIn";

export const Route = createFileRoute("/_public/signin")({
  component: SignIn,
});
