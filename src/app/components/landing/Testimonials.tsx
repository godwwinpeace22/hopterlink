import { useCallback } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const testimonials = [
  {
    title: "Quality of work was excellent",
    text: "I had a great experience with ABC Electrical on the Services. The electrician arrived on time!!!",
    author: "Robert Anderson",
    avatar: "/img/profiles/avatar-14.jpg",
    timeAgo: "2 Days Ago",
  },
  {
    title: "Green Cleaning",
    text: "I love that they use eco-friendly products without compromising on cleanliness with care.",
    author: "Delois Coffin",
    avatar: "/img/profiles/avatar-15.jpg",
    timeAgo: "3 Days Ago",
  },
  {
    title: "Luxury Car Cleaning",
    text: "Exceptional care for my luxury vehicle. The team treated my car with precision and care.",
    author: "Matthew Hicks",
    avatar: "/img/profiles/avatar-13.jpg",
    timeAgo: "5 Days Ago",
  },
  {
    title: "Quick and reliable",
    text: "They fixed my issue in no time and got everything running smoothly again! Good work",
    author: "Daniel Davis",
    avatar: "/img/profiles/avatar-12.jpg",
    timeAgo: "7 Days Ago",
  },
];

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-16 lg:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Genuine reviews from{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Customers
            </span>
          </h2>
          <p className="text-gray-600">
            Each listing is designed to be clear and concise, providing
            customers with the best experience.
          </p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
                >
                  <div className="bg-white rounded-xl border border-gray-100 p-6 h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    {/* Stars */}
                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 text-amber-400 fill-amber-400"
                        />
                      ))}
                    </div>

                    <h5 className="font-semibold text-gray-900 mb-2">
                      {testimonial.title}
                    </h5>
                    <p className="text-gray-600 text-sm mb-6 flex-1 leading-relaxed">
                      "{testimonial.text}"
                    </p>

                    {/* Author */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          className="h-10 w-10 rounded-full object-cover shrink-0"
                        />
                        <h6 className="font-semibold text-gray-900 text-sm truncate">
                          {testimonial.author}
                        </h6>
                      </div>
                      <p className="text-xs text-gray-500 whitespace-nowrap">
                        {testimonial.timeAgo}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 h-10 w-10 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Summary */}
        <div className="text-center mt-10">
          <h6 className="font-semibold text-gray-900 mb-2">
            Each listing is designed to be clear and concise, providing
            customers
          </h6>
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium text-gray-900">Excellent</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-amber-400 fill-amber-400"
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">Based on 456 reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
}
