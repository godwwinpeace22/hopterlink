import { Shield, Heart, Award, Globe, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@/lib/router";

const steps = [
  {
    icon: Shield,
    title: "Create your profile",
    description:
      "Sign up for free, complete your professional profile, and showcase your skills, certifications, and portfolio. Set your service areas and availability schedule.",
  },
  {
    icon: Heart,
    title: "Get job requests",
    description:
      "Browse available jobs in your area or receive direct requests from clients. Our smart matching system connects you with clients who need your specific expertise.",
  },
  {
    icon: Award,
    title: "Complete & earn",
    description:
      "Complete the job to the client's satisfaction and receive secure payment directly to your account. Fast payouts within 1-3 business days, every time.",
  },
  {
    icon: Globe,
    title: "Build reputation",
    description:
      "Earn great reviews and build a strong reputation to attract more clients. Top-rated providers get featured placement and earn more bookings.",
  },
];

export default function ForProviders() {
  return (
    <section className="bg-[#FEF9F1] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#FDEFD6] uppercase flex items-center justify-center px-3 py-1 mx-auto rounded-3xl text-xs text-[#0a0a0a]">
              For service providers
            </div>
          </div>
          <p className="text-3xl sm:text-4xl text-[#0A0A0A] font-bold">
            Start earning in 4 simple steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            return (
              <div key={index} className=" p-5 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-[#2B2B2B] text-[#F7C876] p-4 w-12 h-12 flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg capitalize font-bold text-black mb-2">
                  {step.title}
                </h3>
                <p className="text-[#717182] leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center items-center">
          <Button
            asChild
            variant={"outline"}
            className="mt-10 mx-auto flex border-black hover:border-2 items-center bg-[#fef9f1] text-black hover:bg-[#fef9f1]/90"
          >
            <Link to="/provider-signup" className="flex items-center">
              Become a provider
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
