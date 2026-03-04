import { Users } from "lucide-react";

const team = [
  {
    name: "Isah-Orbih Osilama",
    role: "CEO & Founder",
    bio: "Former operations lead at a top-10 marketplace. Passionate about empowering local service professionals.",
  },
  {
    name: "Godwin Gabriel",
    role: "CTO",
    bio: "Full-stack engineer with 12 years of experience building secure, scalable marketplace platforms.",
  },
  {
    name: "Wojuola Samuel",
    role: "Product Design Lead",
    bio: "Background in compliance and fraud prevention. Ensures every provider meets our rigorous standards.",
  },
];

export default function AboutTeam() {
  return (
    <section className="bg-[#FEF9F1] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">
            Meet the Team
          </h2>
          <p className="text-xl text-[#717182]">
            The people building the future of local services
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 p-8 text-center"
            >
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-black mb-1">
                {member.name}
              </h3>
              <p className="text-sm font-semibold text-[#717182] mb-4">
                {member.role}
              </p>
              <p className="text-[#717182] leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
