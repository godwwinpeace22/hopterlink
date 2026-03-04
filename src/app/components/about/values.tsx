import { Shield, Heart, Award, Globe } from "lucide-react";

const values = [
  {
    icon: Globe,
    title: "Diverse Range of Services",
    description:
      "From everyday essentials to specialized services, Hopterlink offers a vast array of options. Whether you're a consumer seeking reliable services or a provider looking to reach a broader audience, our platform is designed to support you.",
  },
  {
    icon: Heart,
    title: "Seamless User Experience",
    description:
      "Our intuitive interface makes it easy to navigate, find what you need, and interact with service providers. With instant messaging, detailed reviews, and star rankings, every interaction on Hopterlink is smooth and satisfying.",
  },
  {
    icon: Shield,
    title: "Security & Trust",
    description:
      "We prioritize your safety and security. Hopterlink employs advanced encryption and secure payment gateways to protect your data and transactions, plus a robust reporting system that ensures all users adhere to our community guidelines.",
  },
  {
    icon: Award,
    title: "Continuous Improvement",
    description:
      "Hopterlink is committed to innovation. We listen to our users and constantly evolve the platform to better serve their needs, keeping us at the cutting edge of technology and user experience.",
  },
];

export default function AboutValues() {
  return (
    <section className="bg-[#FEF9F1] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            What We Offer
          </h2>
          <p className="text-xl text-[#717182]">
            Everything you need, all in one platform
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
                    <Icon className="w-6 h-6 text-amber-500" />
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
