import { Card, CardContent } from "../ui/card";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    rating: 5,
    text: "Found a great landscaper in minutes! The availability scheduler made it so easy to book someone who could come the same day.",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    name: "Mike Rodriguez",
    role: "Handyman Provider",
    rating: 5,
    text: "Fixers Hive has transformed my business. I get consistent bookings and the payment system is reliable. Best platform for independent contractors.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    name: "Emily Chen",
    role: "Property Manager",
    rating: 5,
    text: "I manage 12 properties and use Fixers Hive for everything from cleaning to emergency repairs. The escrow system gives me peace of mind.",
    image:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
  {
    name: "David Thompson",
    role: "Snow Removal Provider",
    rating: 5,
    text: "The 2-week availability feature is a game changer. Clients can see exactly when I'm free, and I fill my schedule weeks in advance.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  },
  {
    name: "Jessica Martinez",
    role: "Small Business Owner",
    rating: 5,
    text: "As a cleaning service owner, Fixers Hive helps me reach more customers without expensive advertising. The 3-5% commission is very fair.",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  },
  {
    name: "Robert Lee",
    role: "Homeowner",
    rating: 5,
    text: "Used the platform to find a mechanic for my car. Got three quotes within an hour and saved $200 compared to the dealership!",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Clients & Providers
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands who trust Fixers Hive for their service needs
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-[#F7C876] text-[#F7C876]"
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-black mb-2">4.8/5</div>
              <div className="text-[#AB7501]">Average Rating</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">50K+</div>
              <div className="text-[#AB7501]">Jobs Completed</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">5K+</div>
              <div className="text-[#AB7501]">Active Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-black mb-2">98%</div>
              <div className="text-[#AB7501]">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
