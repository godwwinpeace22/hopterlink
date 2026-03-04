import { Card, CardContent } from "../ui/card";
import { Shield, DollarSign, Clock, Award, Lock, Users } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Verified Professionals",
    description:
      "All service providers undergo background checks and credential verification",
    isInsurance: false,
  },
  {
    icon: Lock,
    title: "Secure Escrow Payments",
    description:
      "Your payment is protected until the job is completed to your satisfaction",
    isInsurance: false,
  },
  {
    icon: Clock,
    title: "Real-Time Availability",
    description:
      "See provider schedules up to 2 weeks in advance and book instantly",
    isInsurance: false,
  },
  {
    icon: DollarSign,
    title: "Transparent Pricing",
    description:
      "Providers set their own rates. No hidden fees or surprise charges",
    isInsurance: false,
  },
  {
    icon: Award,
    title: "Ratings & Reviews",
    description:
      "Make informed decisions with verified reviews from real customers",
    isInsurance: false,
  },
  {
    icon: Users,
    title: "Dispute Resolution",
    description:
      "Fair mediation process protects both clients and service providers",
    isInsurance: false,
  },
];

export function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trust & Safety First
          </h2>
          <p className="text-xl text-gray-600">
            We've built a platform that prioritizes security, transparency, and
            peace of mind
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                className="border-2 hover:border-[#F7C876] transition-colors"
              >
                <CardContent className="p-8">
                  <div className="h-14 w-14 bg-[#FDEFD6] rounded-lg flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-[#F7C876]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title.split(" ").map((word, i) => {
                      if (
                        word === "Verified" ||
                        word === "Secure" ||
                        word === "Protected"
                      ) {
                        return (
                          <span key={i} className="text-[#F9AC1E]">
                            {word}{" "}
                          </span>
                        );
                      }
                      return word + " ";
                    })}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description.split(" ").map((word, i) => {
                      const cleanWord = word.replace(/[,.]/, "");
                      if (
                        cleanWord === "verified" ||
                        cleanWord === "protected"
                      ) {
                        return (
                          <span key={i} className="text-[#F9AC1E]">
                            {word}{" "}
                          </span>
                        );
                      }
                      return word + " ";
                    })}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Insurance Notice */}
        <div className="mt-16 mx-auto">
          <Card className="bg-[#FDEFD6] border-[#FFC9C9]">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 bg-[#2B2B2B] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-6 w-6 text-[#F7C876]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Insurance Coverage Options
                  </h3>
                  <p className="text-gray-700 mb-4">
                    All service providers must carry their own insurance or
                    opt-in to Fixers Hive's optional coverage plan. Your
                    projects are always{" "}
                    <span className="text-red-600 font-semibold">
                      protected
                    </span>
                    .
                  </p>
                  <button className="text-[#F1A400] hover:text-[#EFA055] font-semibold">
                    Learn more about insurance →
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
