import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/app/components/landing/Header";
import { CTA } from "@/app/components/landing/CTA";
import { Footer } from "@/app/components/landing/Footer";

export const Route = createFileRoute("/_public")({
  component: () => (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
        <CTA />
      </main>
      <Footer />
    </div>
  ),
});
