import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@/lib/router";
import { Search, MapPin, Star, CheckCircle } from "lucide-react";

const typedWords = [
  "Designers",
  "Plumbers",
  "Electricians",
  "Cleaners",
  "Painters",
  "Landscapers",
];

const popularSearches = [
  "Designers",
  "Interior",
  "Nail Technicians",
  "Electricians",
];

export function Hero() {
  const navigate = useNavigate();
  const [currentWord, setCurrentWord] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchService, setSearchService] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const word = typedWords[currentWord];

    if (!isDeleting) {
      if (displayText.length < word.length) {
        timeoutRef.current = window.setTimeout(() => {
          setDisplayText(word.slice(0, displayText.length + 1));
        }, 100);
      } else {
        timeoutRef.current = window.setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (displayText.length > 0) {
        timeoutRef.current = window.setTimeout(() => {
          setDisplayText(word.slice(0, displayText.length - 1));
        }, 50);
      } else {
        setIsDeleting(false);
        setCurrentWord((prev) => (prev + 1) % typedWords.length);
      }
    }

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [displayText, isDeleting, currentWord]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/services?q=${searchService}&location=${searchLocation}`);
  };

  return (
    <section
      className="relative overflow-hidden bg-white py-16 lg:py-24"
      id="home"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold leading-tight text-gray-900">
              Connect with Nearby Top-rated Professional{" "}
              <span className="inline-block min-w-[12ch] whitespace-nowrap bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent align-baseline">
                {displayText}
                <span className="animate-pulse">|</span>
              </span>
            </h1>

            <p className="text-lg text-gray-600 max-w-lg">
              We can connect you to the right Service, first time and every
              time.
            </p>

            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row items-stretch bg-white border border-gray-200 rounded-xl p-2 shadow-lg gap-2"
            >
              <div className="flex items-center flex-1 px-3 py-2 gap-2">
                <Search className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search for Service"
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  value={searchService}
                  onChange={(e) => setSearchService(e.target.value)}
                />
              </div>
              <div className="hidden md:block w-px bg-gray-200" />
              <div className="flex items-center flex-1 px-3 py-2 gap-2">
                <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Enter Location"
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder:text-gray-400"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all whitespace-nowrap"
              >
                <Search className="h-4 w-4" />
                Search
              </button>
            </form>

            {/* Popular Searches */}
            <div className="flex items-center flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">
                Popular Searches
              </span>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => navigate(`/services?q=${term}`)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="flex items-center flex-wrap gap-6 pt-2">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">215,292+</p>
                  <p className="text-xs text-gray-500">Verified Providers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">90,000+</p>
                  <p className="text-xs text-gray-500">Services Completed</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-full bg-amber-100 flex items-center justify-center">
                  <Star className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">2,390,968</p>
                  <p className="text-xs text-gray-500">Reviews Globally</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Hero Image */}
          <div className="relative hidden lg:block">
            <img
              src="/img/banner.png"
              alt="Service professional"
              className="w-full max-w-lg mx-auto animate-float"
            />

            {/* Floating Badge — Rating */}
            <div className="absolute top-10 left-0 bg-white shadow-xl rounded-lg px-4 py-3 flex items-center gap-3 animate-float-x">
              <span className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center">
                <Star className="h-5 w-5 text-white fill-white" />
              </span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">4.9 / 5</p>
                <p className="text-xs text-gray-500">(255 reviews)</p>
              </div>
            </div>

            {/* Floating Badge — Bookings */}
            <div className="absolute bottom-20 right-0 bg-white shadow-xl rounded-lg px-4 py-3 flex items-center gap-3 animate-float-x-delayed">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <p className="text-sm font-medium text-gray-800">
                300 Booking Completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
