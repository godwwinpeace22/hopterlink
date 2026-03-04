import { Search, Star, Shield, Clock } from "lucide-react";

const features = [
  {
    id: 1,
    title: "Easy Search",
    description:
      "Filter by service type, location, availability, rating, and price range",
    icon: Search,
  },
  {
    id: 2,
    title: "Verified Reviews",
    description:
      "Real reviews from real customers help you make informed decisions",
    icon: Star,
  },
  {
    id: 3,
    title: "Secure Booking",
    description:
      "Your payment is held in escrow until the job is completed to your satisfaction",
    icon: Shield,
  },
  {
    id: 4,
    title: "Instant Availability",
    description:
      "See real-time availability and book same-day or schedule weeks ahead",
    icon: Clock,
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full mx-auto py-5 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={feature.id}
                className="rounded-lg bg-white py-3 flex gap-4"
              >
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2B2B2B]">
                    <IconComponent className="h-4 w-4 text-[#F7C876]" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#0A0A0A]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-[#717182]">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
