import { Shield, Heart, Award, Globe, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@/lib/router";

const steps = [
  {
    icon: Shield,
    title: "Search & Discover",
    description:
      "Browse service categories or search for specific providers. View ratings, availability, and pricing. Filter by location, price range, and reviews to find the perfect match.",
  },
  {
    icon: Heart,
    title: "Request & Book",
    description:
      "Describe your job and receive quotes from available providers. Compare profiles, reviews, and pricing. Choose the best fit and book instantly with our streamlined scheduling system.",
  },
  {
    icon: Award,
    title: "Pay Securely",
    description:
      "Fund your job with our secure payment system. Money is held in escrow until work is completed to your satisfaction. No upfront payments to unknown providers.",
  },
  {
    icon: Globe,
    title: "Rate & Review",
    description:
      "Once the job is complete, rate your experience and help build a trusted community. Your honest feedback helps other clients and rewards great providers.",
  },
];

export default function ForClients() {
  return (
    <section className=" py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-[#FDEFD6] uppercase flex items-center justify-center px-3 py-1 mx-auto rounded-3xl text-xs text-[#0a0a0a]">
              For clients
            </div>
          </div>
          <p className="text-3xl sm:text-4xl text-[#0A0A0A] font-bold">
            Find and book a Pro in 4 easy steps
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => {
            return (
              <div key={index} className="bg-white p-5 text-center">
                <div className="flex justify-center mb-4">
                  <div className="bg-[#2B2B2B] text-[#F7C876] p-4 w-12 h-12 flex items-center justify-center rounded-full">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
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
            className="mt-10 mx-auto flex items-center bg-[#F7C876] hover:bg-[#EFA055] text-black"
          >
            <Link to="/client-signup" className="flex items-center">
              Browse Services
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
