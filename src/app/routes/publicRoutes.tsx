import { Outlet, Route } from "react-router-dom";
import { ClientSignup } from "../components/pages/ClientSignup";
import { ProviderSignup } from "../components/pages/ProviderSignup";
import { SignIn } from "../components/pages/SignIn";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { ServiceCategories } from "../components/landing/ServiceCategories";
import { HowItWorks } from "../components/landing/HowItWorks";
import { Features } from "../components/landing/Features";
import { Testimonials } from "../components/landing/Testimonials";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";
import { Services } from "../components/pages/Services";
import { paths } from "./paths";
import { About } from "../components/pages/about";
import { HowItWorksPage } from "../components/pages/howItWorks";

export function PublicRoutes() {
  return (
    <Route
      element={
        <div className="min-h-screen bg-white flex flex-col">
          <Header />
          <main className="flex-1">
            <Outlet />
            <CTA />
          </main>
          <Footer />
        </div>
      }
    >
      <Route
        path={paths.home}
        element={
          <>
            <Hero />
            <ServiceCategories />
            <HowItWorks />
            <Features />
            <Testimonials />
          </>
        }
      />
      <Route path={paths.auth.clientSignup} element={<ClientSignup />} />
      <Route path={paths.auth.providerSignup} element={<ProviderSignup />} />
      <Route path={paths.auth.signIn} element={<SignIn />} />
      <Route path={paths.services} element={<Services />} />
      <Route path={paths.howItWorks} element={<HowItWorksPage />} />
      <Route path={paths.about} element={<About />} />
    </Route>
  );
}
