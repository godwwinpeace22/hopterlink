import { useState, useCallback } from "react";
import { Link } from "@/lib/router";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
  Heart,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslation } from "react-i18next";

interface ServiceItem {
  title: string;
  price: string;
  rating: string;
  trending?: boolean;
  images: string[];
}

const services: ServiceItem[] = [
  {
    title: "Brand Identity & Graphics Design",
    price: "$55",
    rating: "4.9",
    trending: true,
    images: [
      "/img/278bd27bab02e12cdaebe52cd5f0e324fca49567d4ba3ac028ca43bb8f65d3c1.jpeg",
      "/img/016fd0c3c404386e167b7e6f2fa2d3073fd7c90e65a9b7e613cfe8e731e013f2.jpeg",
      "/img/579c4063f37b049cbfb6191bbc0e64e541b146f549272d94151a5f8c9117b3d0.jpeg",
    ],
  },
  {
    title: "UI/UX Design for Mobile & Web",
    price: "$70",
    rating: "4.8",
    trending: true,
    images: [
      "/img/982bdea559925f684050aefe30b8c477b9e8f7f87355bf12a8920c19ab91493e.jpeg",
      "/img/373483a3e28da6084220e990d87db00894c3de2ef1fd4fc2bbce1bf92f19c36b.jpeg",
      "/img/6a9b22cbfbf3f14d4d6faf96f8d6f36f0f05cc771602afe73517a672f935d938.jpeg",
    ],
  },
  {
    title: "Website Landing Page Development",
    price: "$90",
    rating: "4.7",
    images: [
      "/img/96b1aa4d8cca325d741ceb891505bf2e37e514a547dd32b30d126618a0b03639.jpeg",
      "/img/2a6f3c27cf7ad65a306bcb3b23e23ce720e3165658f5c321b9fe08020859113f.jpeg",
      "/img/86993792c1b771e5bcb374cd36206af6a213c91dbf04fa7006161005fd0ac374.jpeg",
    ],
  },
  {
    title: "Professional Delivery Services",
    price: "$40",
    rating: "4.5",
    trending: true,
    images: [
      "/img/278bd27bab02e12cdaebe52cd5f0e324fca49567d4ba3ac028ca43bb8f65d3c1.jpeg",
      "/img/016fd0c3c404386e167b7e6f2fa2d3073fd7c90e65a9b7e613cfe8e731e013f2.jpeg",
      "/img/579c4063f37b049cbfb6191bbc0e64e541b146f549272d94151a5f8c9117b3d0.jpeg",
    ],
  },
  {
    title: "Classic Manicure & Set of Nails",
    price: "$20",
    rating: "4.4",
    trending: true,
    images: [
      "/img/9c4ca72c47282e62dc692f8ae63d751e0cf891b7892333ef46c137576b4f6ce2.jpeg",
      "/img/54940376d3d2dcb774f74e15776d22cd46cecb11c82b40eceec1193f58797c76.jpeg",
      "/img/12c5af8406d9dc758ac4e21df074187b9e9915680182b755d355419ff91a4376.jpeg",
    ],
  },
  {
    title: "Water Heater Installation",
    price: "$65",
    rating: "4.2",
    images: [
      "/img/96b1aa4d8cca325d741ceb891505bf2e37e514a547dd32b30d126618a0b03639.jpeg",
      "/img/2a6f3c27cf7ad65a306bcb3b23e23ce720e3165658f5c321b9fe08020859113f.jpeg",
      "/img/86993792c1b771e5bcb374cd36206af6a213c91dbf04fa7006161005fd0ac374.jpeg",
    ],
  },
  {
    title: "General House & Carpet Clean",
    price: "$95",
    rating: "4.7",
    images: [
      "/img/982bdea559925f684050aefe30b8c477b9e8f7f87355bf12a8920c19ab91493e.jpeg",
      "/img/373483a3e28da6084220e990d87db00894c3de2ef1fd4fc2bbce1bf92f19c36b.jpeg",
      "/img/6a9b22cbfbf3f14d4d6faf96f8d6f36f0f05cc771602afe73517a672f935d938.jpeg",
    ],
  },
  {
    title: "Custom PC Builds",
    price: "$85",
    rating: "4.8",
    images: [
      "/img/services/service-16.jpg",
      "/img/services/service-17.jpg",
      "/img/services/service-18.jpg",
    ],
  },
];

function ServiceImageCarousel({ images }: { images: string[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div className="relative group/img overflow-hidden rounded-t-xl">
      <img
        src={images[currentIndex]}
        alt="Service"
        className="w-full h-52 object-cover transition-transform duration-300 group-hover/img:scale-105"
      />
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((i) => (i - 1 + images.length) % images.length);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCurrentIndex((i) => (i + 1) % images.length);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${i === currentIndex ? "bg-white" : "bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function FeaturedServices() {
  const { t } = useTranslation();
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
            {t("featuredServices.titleMain")}{" "}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              {t("featuredServices.titleHighlight")}
            </span>
          </h2>
          <p className="text-gray-600">{t("featuredServices.subtitle")}</p>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6 -ml-0">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333%] min-w-0"
                >
                  <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow">
                    <div className="relative">
                      <ServiceImageCarousel images={service.images} />
                      {service.trending && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-md">
                            <TrendingUp className="h-3 w-3" />
                            {t("featuredServices.trending")}
                          </span>
                        </div>
                      )}
                      <button className="absolute top-3 right-3 h-8 w-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="p-4">
                      <h6 className="font-semibold text-gray-900 truncate mb-2">
                        <Link
                          to="/services"
                          className="hover:text-amber-600 transition-colors"
                        >
                          {service.title}
                        </Link>
                      </h6>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-600">
                          {t("featuredServices.serviceStartsAt", {
                            price: service.price,
                          })}
                        </p>
                        <span className="inline-flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          {service.rating}
                        </span>
                      </div>
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

        {/* View All */}
        <div className="text-center mt-10">
          <Link
            to="/services"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            {t("featuredServices.viewAll")}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
