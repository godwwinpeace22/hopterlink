import Faq from "../howitworks/FAQ";
import ForClients from "../howitworks/ForClients";
import ForProviders from "../howitworks/ForProviders";
import { HowItWorksHero } from "../howitworks/HowItWorksHero";
import WhyChooseUs from "../howitworks/WhyChooseUs";

export function HowItWorksPage() {
  return (
    <>
      <HowItWorksHero />
      <ForClients />
      <ForProviders />
      <WhyChooseUs />
      <Faq />
    </>
  );
}
