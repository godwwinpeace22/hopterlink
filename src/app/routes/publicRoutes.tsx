import { Outlet, Route } from "react-router-dom";
import { ClientSignup } from "../components/pages/ClientSignup";
import { ProviderSignup } from "../components/pages/ProviderSignup";
import { SignIn } from "../components/pages/SignIn";
import { Header } from "../components/landing/Header";
import { Hero } from "../components/landing/Hero";
import { ServiceCategories } from "../components/landing/ServiceCategories";
import { HowItWorks } from "../components/landing/HowItWorks";
import { FeaturedServices } from "../components/landing/FeaturedServices";
import { Testimonials } from "../components/landing/Testimonials";
import { ProviderCTA } from "../components/landing/ProviderCTA";
import { CTA } from "../components/landing/CTA";
import { Footer } from "../components/landing/Footer";
import { Services } from "../components/pages/Services";
import { paths } from "./paths";
import { About } from "../components/pages/about";
import { HowItWorksPage } from "../components/pages/howItWorks";
import { Providers } from "../components/pages/Providers";
import { ProviderProfile } from "../components/pages/ProviderProfilePage";
import { ForgotPassword } from "../components/pages/ForgotPassword";
import { ResetPassword } from "../components/pages/ResetPassword";
import { EmailVerification } from "../components/pages/EmailVerification";

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
            <FeaturedServices />
            <HowItWorks />
            <Testimonials />
            <ProviderCTA />
          </>
        }
      />
      <Route path={paths.auth.clientSignup} element={<ClientSignup />} />
      <Route path={paths.auth.providerSignup} element={<ProviderSignup />} />
      <Route path={paths.auth.signIn} element={<SignIn />} />
      <Route path={paths.auth.forgotPassword} element={<ForgotPassword />} />
      <Route path={paths.auth.resetPassword} element={<ResetPassword />} />
      <Route
        path={paths.auth.emailVerification}
        element={<EmailVerification />}
      />
      <Route path={paths.services} element={<Services />} />
      <Route path={paths.providers} element={<Providers />} />
      <Route path={paths.providerProfile} element={<ProviderProfile />} />
      <Route path={paths.howItWorks} element={<HowItWorksPage />} />
      <Route path={paths.about} element={<About />} />
    </Route>
  );
}
