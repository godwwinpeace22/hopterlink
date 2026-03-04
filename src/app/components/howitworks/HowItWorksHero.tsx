import HowItWorksHeroImage from "@/assets/howitworks-hero.jpg";

export function HowItWorksHero() {
  return (
    <section className="relative overflow-hidden" id="how-it-works">
      <img
        src={HowItWorksHeroImage}
        alt="How Hopterlink Works"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          How Hopterlink Works
        </h1>

        <p className="mt-6 max-w-3xl text-base text-[#d4d4d4] sm:text-lg">
          Whether you need a service or want to offer one, our platform makes it
          simple, secure, and reliable for everyone.
        </p>
      </div>
    </section>
  );
}
