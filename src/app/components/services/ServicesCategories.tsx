"use client";

import { Star, ChevronRight, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { services as landingServices } from "../landing/ServiceCategories";
import { useAuth } from "@/contexts/AuthContext";
import { paths } from "@/app/routes/paths";

interface ServiceCategory {
  id: string;
  name: string;
  rating: number;
  description: string;
  providerCount: number;
}

function getServiceImage(name: string) {
  return landingServices.find((service) => service.title === name)?.image ?? "";
}

const services: ServiceCategory[] = [
  {
    id: "snow-cleaning",
    name: "Snow Cleaning",
    rating: 4.9,
    description:
      "Fast snow removal for driveways, walkways, and parking lots. Available 24/7 during winter storms with eco-friendly treatments.",
    providerCount: 320,
  },
  {
    id: "landscaping",
    name: "Landscaping",
    rating: 4.8,
    description:
      "Lawn mowing, trimming, garden maintenance, and full landscape design. Transform your outdoor space with expert care.",
    providerCount: 580,
  },
  {
    id: "cleaning-services",
    name: "Cleaning Services",
    rating: 4.9,
    description:
      "Professional home and office cleaning including deep cleaning, move-in/move-out, and recurring weekly or biweekly service.",
    providerCount: 720,
  },
  {
    id: "auto-services",
    name: "Auto Services",
    rating: 4.7,
    description:
      "Mobile mechanics, car detailing, oil changes, and basic repairs. Our verified auto pros come to your location.",
    providerCount: 280,
  },
  {
    id: "handyman",
    name: "Handyman",
    rating: 4.8,
    description:
      "General repairs, furniture assembly, drywall patching, plumbing fixes, and all those small jobs around the house.",
    providerCount: 640,
  },
  {
    id: "painting",
    name: "Painting",
    rating: 4.8,
    description:
      "Interior and exterior painting for homes and businesses. Color consultation, prep work, and clean professional results.",
    providerCount: 410,
  },
  {
    id: "personal-care",
    name: "Personal Care",
    rating: 4.9,
    description:
      "Barbers, hair stylists, and beauty professionals who come to you. Comprehensive needs quality personal grooming.",
    providerCount: 350,
  },
  {
    id: "childcare",
    name: "Childcare",
    rating: 4.9,
    description:
      "Babysitting and nanny services from background-checked caregivers. Flexible hourly or full-day bookings.",
    providerCount: 260,
  },
  {
    id: "dog-walking",
    name: "Dog Walking",
    rating: 4.8,
    description:
      "Reliable dog walking for busy pet owners. Midday walks, weekend adventures, and specialized attention for energetic, anxious, or senior dogs.",
    providerCount: 480,
  },
  {
    id: "moving-help",
    name: "Moving Help",
    rating: 4.7,
    description:
      "Pickup trucks and light moving assistance for apartment moves, furniture delivery, and junk removal.",
    providerCount: 310,
  },
];

export default function ServiceCategories() {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  const handleBrowseClick = () => {
    if (isLoading) {
      return;
    }

    if (user) {
      navigate(paths.dashboard.client.absolute("providers"));
      return;
    }

    toast.info("Please sign up to continue browsing providers.");
    navigate(paths.auth.clientSignup);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              All Service Categories
            </h1>
            <p className="text-gray-600 text-sm">
              10 categories • 5,000+ verified providers
            </p>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <div className="relative h-48 w-full bg-gray-200">
                  <img
                    src={getServiceImage(service.name)}
                    alt={service.name}
                    className="object-cover w-full h-full"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Title and Rating */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </h2>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star size={16} className="fill-gray-900 text-gray-900" />
                      <span className="text-sm font-medium text-gray-900">
                        {service.rating}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                    {service.description}
                  </p>

                  {/* Provider Count and Browse */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-green-600" />
                      <span className="text-xs text-gray-600">
                        {service.providerCount}+ providers
                      </span>
                    </div>
                    <button
                      onClick={handleBrowseClick}
                      className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1"
                    >
                      Browse
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
