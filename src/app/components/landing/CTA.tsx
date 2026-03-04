import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import footerImg from "@/assets/footer-img.png";

export function CTA() {
  const navigate = useNavigate();
  return (
    <section
      className="py-20 text-[#2B2B2B] relative"
      style={{
        background:
          "linear-gradient(135deg, rgba(247, 200, 118, 0.7) 0%, #F1A400 50%, rgba(241, 164, 0, 0.7) 100%)",
      }}
    >
      <div
        className="absolute top-0 inset-x-0 h-16 bg-white pointer-events-none"
        aria-hidden="true"
      />
      <img
        src={footerImg}
        alt="Fixers Hive illustration"
        className="hidden lg:block absolute -top-10 right-0 w-auto object-contain drop-shadow-2xl pointer-events-none"
        style={{ height: "calc(100% + 32px)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-[#4A5565E5] mb-10 max-w-2xl mx-auto">
            Join thousands of happy clients and service providers. Sign up today
            and get your first job posted or booked in minutes.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white hover:bg-white/90 cursor-pointer text-black text-lg px-10 py-7 rounded-xl shadow-2xl hover:shadow-3xl transition-all"
              onClick={() => navigate("/client-signup")}
            >
              Find a Service Provider
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="bg-transparent border-2 cursor-pointer border-white text-white hover:bg-white/10 text-lg px-10 py-7 rounded-xl"
              onClick={() => navigate("/provider-signup")}
            >
              Start Earning as a Provider
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-black/90">
            <div className="flex items-center gap-2">
              <span className="text-black font-bold text-xl">✓</span>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black font-bold text-xl">✓</span>
              <span>Free account setup</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black font-bold text-xl">✓</span>
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
