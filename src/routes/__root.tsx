import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Toaster } from "@/app/components/ui/sonner";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});
