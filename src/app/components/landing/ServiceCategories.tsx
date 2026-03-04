import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Graphics Design",
    listings: "6,214",
    icon: "/img/65664c9123bd3602ba998a91d67b96c88561abf7e4c5f5c6fc22037dbae506bd.svg",
  },
  {
    name: "UI/UX Design",
    listings: "5,108",
    icon: "/img/39dcfa54baf99b6f632ba4c284f9483949b9c7671c7349b2a48b32327c7832be.svg",
    isNew: true,
  },
  {
    name: "Web Development",
    listings: "4,892",
    icon: "/img/8104af6bf4c582eac2dcf6281e3c0f234520ba8e971b0480e872707522e8dc3b.svg",
  },
  {
    name: "Construction",
    listings: "9,874",
    icon: "/img/c4adc0ac7a613b17aff2c3d7d0e3ae482565358ed21cb9224c78d103ce70c811.svg",
  },
  {
    name: "Removals",
    listings: "787",
    icon: "/img/e82f7e6ab010b990de8df175b37fe3fdb0485cbb42789e0ccdc170b228585d86.svg",
  },
  {
    name: "Cleaning",
    listings: "2,357",
    icon: "/img/7f2f17a5d72f3865cede669be4652ef20fc9a173e115105d4c2b75b80a1cde3c.svg",
  },
  {
    name: "Computer Service",
    listings: "1,260",
    icon: "/img/65664c9123bd3602ba998a91d67b96c88561abf7e4c5f5c6fc22037dbae506bd.svg",
  },
  {
    name: "Electrical",
    listings: "4,546",
    icon: "/img/8104af6bf4c582eac2dcf6281e3c0f234520ba8e971b0480e872707522e8dc3b.svg",
  },
  {
    name: "Man & Van",
    listings: "2,546",
    icon: "/img/f296eb692c5c80ee570d48323ccaaf295db0bdab49591c0067ad10a0aad98340.svg",
  },
  {
    name: "Deliveries",
    listings: "4,547",
    icon: "/img/99b7e8f0f149c5105a2d18768b639d5a18d427eebb0ffb88a0ee134ba9b8afa5.svg",
  },
  {
    name: "Mobile Barber",
    listings: "4,787",
    icon: "/img/a0bcfbf00a113017b80918ef30b8144753d908c07606e212a912e5e696e92469.svg",
    isNew: true,
  },
  {
    name: "Interior",
    listings: "1,457",
    icon: "/img/39dcfa54baf99b6f632ba4c284f9483949b9c7671c7349b2a48b32327c7832be.svg",
  },
  {
    name: "Plumbing",
    listings: "4,157",
    icon: "/img/9dfaf3043b83e8d961859540a8c9c1655f12b260e46a96715956624c79b313fe.svg",
  },
  {
    name: "Nail Technicians",
    listings: "5,477",
    icon: "/img/5fca287dccc09bd3ac403b1df04e90afc1c0a070c461201a6908f3e1c311ae13.svg",
  },
  {
    name: "Hair Dressers",
    listings: "7,457",
    icon: "/img/6e079160d0f52f66a2b83031c8ce15683ef261c58612d95bf5e5dd65d0f0c3a8.svg",
  },
];

// Re-export for backwards compatibility with ServicesCategories page
export const services = categories.map((c) => ({
  title: c.name,
  image: c.icon,
}));

export function ServiceCategories() {
  return (
    <section className="py-16 lg:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Explore our{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Categories
            </span>
          </h2>
          <p className="text-gray-600">
            Service categories help organize and structure the offerings on a
            marketplace, making it easier for users to find what they need.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/services?category=${encodeURIComponent(cat.name)}`}
              className="group relative flex flex-col items-center text-center bg-white border border-gray-100 rounded-xl p-6 hover:shadow-lg hover:border-amber-200 transition-all duration-300"
            >
              <div className="mb-3 h-14 w-14 flex items-center justify-center">
                <img
                  src={cat.icon}
                  alt={cat.name}
                  className="h-12 w-12 object-contain"
                />
              </div>
              <h6 className="text-sm font-semibold text-gray-900 mb-1">
                {cat.name}
              </h6>
              <p className="text-xs text-gray-500 mb-1">
                {cat.listings} Listings
              </p>
              <span className="text-xs text-amber-600 underline group-hover:text-amber-700">
                View All
              </span>
              {cat.isNew && (
                <span className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  New
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
