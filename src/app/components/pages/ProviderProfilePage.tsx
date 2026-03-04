import { useParams, Link } from "react-router-dom";
import {
  Star,
  MapPin,
  CheckCircle2,
  Briefcase,
  Clock,
  MessageCircle,
  ArrowLeft,
  Calendar,
  Shield,
} from "lucide-react";
import { mockProviders } from "@/app/data/mockProviders";

const mockReviews = [
  {
    id: "r-1",
    author: "Sarah K.",
    rating: 5,
    date: "2025-12-10",
    text: "Absolutely brilliant work! Delivered ahead of schedule and the quality exceeded my expectations. Would highly recommend.",
  },
  {
    id: "r-2",
    author: "Michael T.",
    rating: 4,
    date: "2025-11-22",
    text: "Great communication throughout the project. Minor revision was handled quickly. Very professional.",
  },
  {
    id: "r-3",
    author: "Emma L.",
    rating: 5,
    date: "2025-10-05",
    text: "This was my second time hiring and the results were just as fantastic. Truly talented professional.",
  },
];

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`}
        />
      ))}
    </div>
  );
}

export function ProviderProfile() {
  const { providerId } = useParams();
  const provider = mockProviders.find((p) => p.id === providerId);

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Provider not found
        </h2>
        <p className="text-gray-500 mb-6">
          The profile you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/providers"
          className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Providers
        </Link>
      </div>
    );
  }

  const memberDate = new Date(provider.memberSince).toLocaleDateString(
    "en-GB",
    { month: "long", year: "numeric" },
  );

  return (
    <div className="py-10 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          to="/providers"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          All Providers
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ===== Left column — main info ===== */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero card */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Cover */}
              <div className="h-48 bg-gray-100 overflow-hidden">
                <img
                  src={provider.portfolio[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 -mt-12 relative">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                  <img
                    src={provider.avatar}
                    alt={provider.name}
                    className="h-24 w-24 rounded-full border-4 border-white shadow-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://ui-avatars.com/api/?name=" +
                        encodeURIComponent(provider.name) +
                        "&background=F7C876&color=fff&size=96";
                    }}
                  />
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-gray-900">
                        {provider.name}
                      </h1>
                      {provider.verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mt-0.5">{provider.tagline}</p>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-5 mt-5 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                    <strong className="text-gray-900">
                      {provider.rating}
                    </strong>{" "}
                    ({provider.reviewCount} reviews)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4" />
                    {provider.completedJobs} jobs completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {provider.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    Responds {provider.responseTime.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* About */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                About
              </h2>
              <p className="text-gray-600 leading-relaxed">{provider.bio}</p>
            </div>

            {/* Portfolio gallery */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Portfolio
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {provider.portfolio.map((img, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100"
                  >
                    <img
                      src={img}
                      alt={`Portfolio ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews
              </h2>
              <div className="space-y-5">
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="pb-5 border-b border-gray-100 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">
                          {review.author}
                        </span>
                        <StarRow rating={review.rating} />
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(review.date).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ===== Right column — sidebar ===== */}
          <div className="space-y-6">
            {/* Hire card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 sticky top-24">
              <p className="text-2xl font-bold text-gray-900 mb-1">
                ${provider.hourlyRate}
                <span className="text-base font-normal text-gray-500">/hr</span>
              </p>
              <p className="text-xs text-gray-500 mb-5">
                Starting price — final quote after brief
              </p>

              <button className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-semibold hover:from-amber-600 hover:to-orange-600 transition-all mb-3">
                Hire {provider.name.split(" ")[0]}
              </button>
              <button className="w-full py-3 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Send Message
              </button>

              <div className="mt-5 pt-5 border-t border-gray-100 space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  Member since {memberDate}
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-gray-400" />
                  {provider.verified
                    ? "Identity verified"
                    : "Verification pending"}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  Avg. response: {provider.responseTime.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {provider.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                Category
              </h3>
              <Link
                to={`/services?category=${encodeURIComponent(provider.category)}`}
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                {provider.category}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
