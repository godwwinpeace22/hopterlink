import { Target } from "lucide-react";
import AboutMissionImage from "@/assets/about-mission.jpg";

export default function AboutMission() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Image */}
          <div className="relative h-96 rounded-3xl overflow-hidden">
            <img
              src={AboutMissionImage}
              alt="Our mission - empowering local service economies"
              className="object-cover w-full h-full"
            />
          </div>

          {/* Right Content */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gray-800" />
              <span className="text-sm font-semibold text-gray-800">
                Our Mission
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6 leading-tight">
              Empowering Local Service Economies
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                We believe that local service providers are the backbone of
                every community. But finding trustworthy help shouldn't be a
                gamble. Fixers Hive bridges the gap between skilled
                professionals and the people who need them, with built-in trust,
                safety, and transparency.
              </p>
              <p>
                Our platform gives independent professionals the tools to grow
                their businesses, and gives clients the confidence to hire with
                peace of mind.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
