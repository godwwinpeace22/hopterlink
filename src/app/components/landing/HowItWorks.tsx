const steps = [
  {
    number: "1",
    title: "Post a Service",
    description:
      "After you post a job, our matching system identifies and alerts relevant Providers, who can then express interest in your job.",
    icon: "/img/icons/work-01.svg",
  },
  {
    number: "2",
    title: "Getting Booked & Job Done",
    description:
      "After you post a job, our matching system identifies and alerts relevant Providers, who can then express interest in your job.",
    icon: "/img/icons/work-01.svg",
  },
  {
    number: "3",
    title: "Get Reviewed & Get Leads",
    description:
      "After you post a job, our matching system identifies and alerts relevant Providers, who can then express interest in your job.",
    icon: "/img/icons/work-03.svg",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gray-900 rounded-3xl overflow-hidden px-6 py-16 sm:px-12 sm:py-20">
          {/* Background decorations */}
          <div className="absolute top-0 left-0 opacity-10">
            <img src="/img/bg/work-bg-01.svg" alt="" className="w-48" />
          </div>
          <div className="absolute bottom-0 right-0 opacity-10">
            <img src="/img/bg/work-bg-02.svg" alt="" className="w-48" />
          </div>

          {/* Header */}
          <div className="text-center mb-14 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              How Hopterlink{" "}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
            <p className="text-gray-400 max-w-md mx-auto">
              Each listing is designed to be clear and concise, providing
              customers with the best experience.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step) => (
              <div key={step.number} className="text-center group">
                <div className="mb-5 inline-flex items-center justify-center">
                  <img src={step.icon} alt={step.title} className="h-16 w-16" />
                </div>
                <h6 className="text-white font-semibold text-lg mb-3">
                  {step.number}. {step.title}
                </h6>
                <p className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
