import { ArrowRight } from "lucide-react";

import AboutHeroImage from "@/assets/about-hero.jpg";
import { Link } from "react-router-dom";

export default function AboutHero() {
  return (
    <section className="bg-[#ECECF0] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6 leading-tight">
              Connecting Communities with Trusted Pros
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Fixers Hive was built on a simple belief: everyone deserves access
              to reliable, verified service professionals. We're making that a
              reality across North America.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={"/services"} className="w-full sm:w-auto">
                <button className="w-full px-8 py-3 bg-[#F7C876] hover:bg-[#F7C876]/90 text-black font-semibold rounded-lg transition flex items-center justify-center gap-2">
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <button className="w-full sm:w-auto px-8 py-3 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition">
                How It Works
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 rounded-3xl overflow-hidden">
            <img
              src={AboutHeroImage}
              alt="Trustworthy service professionals"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
