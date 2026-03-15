import { ArrowRight } from "lucide-react";

import AboutHeroImage from "@/assets/about-hero.jpg";
import { Link } from "@/lib/router";

export default function AboutHero() {
  return (
    <section className="bg-[#ECECF0] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-black mb-6 leading-tight">
              About Hopterlink
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Welcome to Hopterlink, your premier platform for connecting
              service providers and consumers in a seamless and efficient
              manner. We believe in the power of connection and the
              opportunities it creates for individuals and businesses alike. Our
              mission is to bridge the gap between supply and demand, providing
              a space where services and products are easily accessible to
              everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to={"/services"} className="w-full sm:w-auto">
                <button className="w-full px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg transition flex items-center justify-center gap-2">
                  Explore Services
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to={"/#how-it-works"}>
                <button className="w-full sm:w-auto px-8 py-3 border-2 border-black text-black font-semibold rounded-lg hover:bg-black hover:text-white transition">
                  How It Works
                </button>
              </Link>
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
