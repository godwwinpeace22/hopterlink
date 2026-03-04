const milestones = [
  {
    year: "2025",
    title: "The Beginning",
    description:
      "Hopterlink was founded with a simple belief — everyone deserves easy access to quality services and trusted professionals.",
  },
  {
    year: "2026",
    title: "Growing Together",
    description:
      "Our dedicated team works tirelessly to ensure that Hopterlink remains at the cutting edge of technology and user experience, providing you with the best possible service.",
  },
  {
    year: "2026",
    title: "Join the Journey",
    description:
      "Whether you're a consumer looking for top-notch services or a provider ready to showcase your offerings, Hopterlink is here to support your journey.",
  },
];
import JourneyImage from "@/assets/about-journey.jpg";
export default function AboutJourney() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Left Timeline */}
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0A0A0A] mb-3">
              Our Commitment
            </h2>
            <p className="text-xl text-[#717182] mb-12">
              Continuous improvement and innovation, always
            </p>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-gray-800 text-amber-500 flex items-center justify-center font-bold text-lg">
                      {index + 1}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300 mt-4"></div>
                    )}
                  </div>
                  <div className="pt-1">
                    <p className="text-sm text-[#030213] font-medium">
                      {milestone.year}
                    </p>
                    <h3 className="text-xl font-bold text-[#0A0A0A] mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-[#717182] leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 lg:h-full rounded-3xl overflow-hidden">
            <img
              src={JourneyImage}
              alt="Our journey illustration"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
