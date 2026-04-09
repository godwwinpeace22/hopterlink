import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqItems = [
  {
    question: "How quickly can I get a service provider?",
    answer:
      "Many providers offer same-day service. You can view real-time availability up to 2 weeks in advance and book instantly.",
  },
  {
    question: "What if I'm not satisfied with the work?",
    answer:
      "Payment is arranged directly between you and the provider. You can discuss terms, timing, and method through chat or in person — giving you full flexibility and control.",
  },
  {
    question: "How are providers verified?",
    answer:
      "All providers undergo background checks and credential verification. We also verify their insurance status and professional licenses where applicable.",
  },
  {
    question: "What does it cost to join as a provider?",
    answer:
      "It's free to create a profile and start receiving job requests. We charge a small 3-5% commission only when you complete a job and get paid.",
  },
  {
    question: "Is my payment information secure?",
    answer:
      "Yes. We take your security seriously. All account data is protected with bank-level encryption. Payment arrangements are handled directly and flexibly between you and your provider.",
  },
  {
    question: "Can I cancel a booking?",
    answer:
      "Yes, you can cancel a booking before the provider starts the job. Cancellation policies vary by provider and are clearly stated before you book.",
  },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="bg-[#FEF9F1] py-16" id="faq">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Everything you need to know about using Hopterlink
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 px-6 py-4 cursor-pointer hover:shadow-sm transition-shadow"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900 mb-2">
                    {item.question}
                  </h3>
                  {openIndex === index && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  )}
                </div>
                <ChevronDown
                  size={20}
                  className={`flex-shrink-0 text-gray-400 transition-transform ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
