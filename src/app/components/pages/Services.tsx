import ServiceCategories from "../services/ServicesCategories";
import ServicesFeatures from "../services/ServicesFeatures";
import { ServicesHero } from "../services/ServicesHero";

export function Services() {
  return (
    <>
      <ServicesHero />
      <ServicesFeatures />
      <ServiceCategories />
    </>
  );
}
