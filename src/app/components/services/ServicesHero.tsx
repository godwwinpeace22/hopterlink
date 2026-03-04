import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import servicesHeroImage from "@/assets/dog-walking.jpg";

export function ServicesHero() {
  return (
    <section className="relative overflow-hidden">
      <img
        src={servicesHeroImage}
        alt="Different home and professional services"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
          Services for every need
        </h1>

        <p className="mt-6 max-w-3xl text-base text-[#d4d4d4] sm:text-lg">
          Browse our popular service categories and find the perfect
          professional for your task. All providers are verified, insured, and
          rated by real customers.
        </p>

        <form
          className="mt-10 w-full max-w-3xl"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="flex h-14 items-center overflow-hidden rounded-xl bg-white shadow-lg">
            <div className="flex items-center pl-4 text-muted-foreground">
              <Search className="h-5 w-5" aria-hidden="true" />
            </div>
            <Input
              type="text"
              placeholder="Search for a service"
              className="h-full border-0 bg-transparent text-foreground shadow-none focus-visible:ring-0"
            />
            <Button
              type="submit"
              className="h-full rounded-none px-6 text-sm font-semibold sm:px-8"
            >
              Search
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
