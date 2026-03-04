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
                Our Vision
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-black mb-6 leading-tight">
              Finding the Right Service in a Click
            </h2>
            <div className="space-y-6 text-gray-600 leading-relaxed">
              <p>
                At Hopterlink, we envision a world where finding the right
                service or product is as simple as a click. We aim to empower
                both consumers and providers by creating a user-friendly
                platform that fosters trust, transparency, and excellence.
              </p>
              <p>
                Our goal is to become the go-to destination for all your service
                needs, whether you're looking for skilled professionals,
                specialized products, or anything in between.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
