import { Card, CardContent } from "../ui/card";
import {
  Wrench,
  Leaf,
  Sparkles,
  Car,
  Hammer,
  Snowflake,
  Scissors,
  Baby,
  PawPrint,
  Truck,
} from "lucide-react";
import snowClearingImg from "@/assets/snow-clearing.png";
import landscapingImg from "@/assets/landscaping.png";
import cleaningServicesImg from "@/assets/cleaning-services.png";
import autoServicesImg from "@/assets/auto-services.png";
import handymanImg from "@/assets/handyman.png";
import paintingImg from "@/assets/painting.png";
import personalCareImg from "@/assets/personal-care.png";
import childcareImg from "@/assets/childcare.png";
import movingHelpImg from "@/assets/moving-help.png";
import dogWalkingImg from "@/assets/dog-walking.jpg";
import { Link } from "react-router-dom";

export const services = [
  {
    icon: Snowflake,
    title: "Snow Cleaning",
    description: "Fast snow removal for driveways and walkways",
    image: snowClearingImg,
  },
  {
    icon: Leaf,
    title: "Landscaping",
    description: "Lawn mowing, trimming, and garden maintenance",
    image: landscapingImg,
  },
  {
    icon: Sparkles,
    title: "Cleaning Services",
    description: "Professional home and office cleaning",
    image: cleaningServicesImg,
  },
  {
    icon: Car,
    title: "Auto Services",
    description: "Mobile mechanics and car detailing",
    image: autoServicesImg,
  },
  {
    icon: Wrench,
    title: "Handyman",
    description: "General repairs and home improvements",
    image: handymanImg,
  },
  {
    icon: Hammer,
    title: "Painting",
    description: "Interior and exterior painting services",
    image: paintingImg,
  },
  {
    icon: Scissors,
    title: "Personal Care",
    description: "Barbers and hair stylists",
    image: personalCareImg,
  },
  {
    icon: Baby,
    title: "Childcare",
    description: "Babysitting and nanny services",
    image: childcareImg,
  },
  {
    icon: PawPrint,
    title: "Dog Walking",
    description: "Trusted walkers for daily pet exercise",
    image: dogWalkingImg,
  },
  {
    icon: Truck,
    title: "Moving Help",
    description: "Pickup trucks and light moving assistance",
    image: movingHelpImg,
  },
];

export function ServiceCategories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Services for Every Need
          </h2>
          <p className="text-xl text-gray-600">
            Browse our popular service categories and find the perfect
            professional for your task
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className="relative hover:shadow-lg transition-shadow cursor-pointer group border-2 hover:border-[#F7C876] overflow-hidden flex flex-col"
              >
                <div className="absolute left-1/2 top-32 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="h-12 w-12 bg-[#2B2B2B] rounded-full flex items-center justify-center group-hover:bg-[#F7C876] transition-colors ring-4 ring-white shadow-md">
                    <Icon className="h-6 w-6 text-[#F1A400] group-hover:text-[#2B2B2B] transition-colors" />
                  </div>
                </div>

                <div className="relative h-32 w-full">
                  <img
                    src={service.image}
                    alt={`${service.title} example`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <CardContent className="p-6 pt-1 text-center flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link to="/services">
            <button className="text-[#F1A400] hover:text-[#EFA055] font-semibold text-lg">
              View all service categories →
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
