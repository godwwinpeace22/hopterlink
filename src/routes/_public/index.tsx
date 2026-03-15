import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/app/components/landing/Hero";
import { ServiceCategories } from "@/app/components/landing/ServiceCategories";
import { HowItWorks } from "@/app/components/landing/HowItWorks";
import { FeaturedServices } from "@/app/components/landing/FeaturedServices";
import { Testimonials } from "@/app/components/landing/Testimonials";
import { ProviderCTA } from "@/app/components/landing/ProviderCTA";

export const Route = createFileRoute("/_public/")({
  component: () => (
    <>
      <Hero />
      <ServiceCategories />
      <FeaturedServices />
      <HowItWorks />
      <Testimonials />
      <ProviderCTA />
    </>
  ),
});
