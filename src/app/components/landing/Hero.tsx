import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-image.png";
import cleaningServicesImage from "@/assets/cleaning-services.png";
import handymanImage from "@/assets/handyman.png";
import landscapingImage from "@/assets/landscaping.png";
import movingHelpImage from "@/assets/moving-help.png";
import paintingImage from "@/assets/painting.png";

const heroServiceImages = [
  { src: heroImage, alt: "Professional handyman with tools" },
  { src: cleaningServicesImage, alt: "Cleaning professional at work" },
  { src: handymanImage, alt: "Handyman service provider" },
  { src: landscapingImage, alt: "Landscaping service in progress" },
  { src: movingHelpImage, alt: "Moving help service team" },
  { src: paintingImage, alt: "Painting service professional" },
];

export function Hero() {
  const navigate = useNavigate();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImageIndex(
        (currentIndex) => (currentIndex + 1) % heroServiceImages.length,
      );
    }, 3000);

    return () => window.clearInterval(interval);
  }, []);

  const activeImage = heroServiceImages[activeImageIndex];

  return (
    <section className="relative bg-gradient-to-br from-[#F7C876] via-[#EFA055] to-[#F1A400] text-[#2B2B2B] overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block bg-[#2B2B2B] backdrop-blur-sm px-4 py-2 rounded-full">
              <span className="text-sm font-medium text-[#F7C876]">
                Trusted Service Marketplace
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Connect with Local Service Pros in Minutes
            </h1>

            <p className="text-xl text-[#2B2B2B]/90 max-w-xl">
              From handymen to landscapers, find verified professionals near
              you. Fast, reliable, and secure.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-[#2B2B2B] text-white hover:bg-[#1a1a1a] text-lg px-8 py-6 rounded-xl shadow-xl hover:shadow-2xl transition-all"
                onClick={() => navigate("/client-signup")}
              >
                I Need a Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-[#2B2B2B] text-[#2B2B2B] hover:bg-[#2B2B2B]/10 text-lg px-8 py-6 rounded-xl"
                onClick={() => navigate("/provider-signup")}
              >
                Become a Provider
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold">5,000+</div>
                <div className="text-sm text-[#2B2B2B]/80">
                  Active Providers
                </div>
              </div>
              <div className="h-12 w-px bg-[#2B2B2B]/30"></div>
              <div>
                <div className="text-3xl font-bold">50,000+</div>
                <div className="text-sm text-[#2B2B2B]/80">Jobs Completed</div>
              </div>
              <div className="h-12 w-px bg-[#2B2B2B]/30"></div>
              <div>
                <div className="text-3xl font-bold">4.8★</div>
                <div className="text-sm text-[#2B2B2B]/80">Average Rating</div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:block hidden">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={activeImage.src}
                alt={activeImage.alt}
                className="w-full h-[500px] object-cover"
              />
              {/* Floating Card */}
              <div className="absolute bottom-6 right-6 bg-white text-gray-900 p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold">Verified Provider</div>
                    <div className="text-sm text-gray-500">
                      Background checked
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
