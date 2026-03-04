import { Shield, Heart, Award, Globe } from "lucide-react";

const values = [
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Every provider is background-checked and verified. Our escrow system protects every transaction.",
  },
  {
    icon: Heart,
    title: "Community First",
    description:
      "We empower local professionals and help communities thrive by keeping business local.",
  },
  {
    icon: Award,
    title: "Quality Standards",
    description:
      "Our rating and review system ensures high-quality service delivery from every provider.",
  },
  {
    icon: Globe,
    title: "Accessibility",
    description:
      "Making professional services accessible and affordable for everyone across North America.",
  },
];

export default function AboutValues() {
  return (
    <section className="bg-[#FEF9F1] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Our Values
          </h2>
          <p className="text-xl text-[#717182]">
            The principles that guide everything we do
          </p>
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
