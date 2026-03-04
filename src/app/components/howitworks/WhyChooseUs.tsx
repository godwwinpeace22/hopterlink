import { Shield, CalendarClock, Gift, CircleCheck } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Secure Escrow",
    description:
      "Payments held safely until work is completed and approved by you.",
  },
  {
    icon: CalendarClock,
    title: "Real-time Scheduling",
    description:
      "View provider availability up to 2 weeks ahead. Book in seconds.",
  },
  {
    icon: Gift,
    title: "Rewards Program",
    description:
      "Earn 0.5% cashback on every $100 spent. Redeem on future bookings.",
  },
  {
    icon: CircleCheck,
    title: "Verified Providers",
    description:
      "Background-checked, credential-verified professionals you can trust.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Why Choose Hopterlink?
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-200 p-5 text-center"
              >
                <div className="flex justify-center mb-4">
                  <div className="bg-[#2B2B2B] text-white p-4 rounded-full">
                    <Icon className="w-6 h-6 text-[#F7C876]" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-black mb-2">
                  {value.title}
                </h3>
                <p className="text-[#717182] leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
