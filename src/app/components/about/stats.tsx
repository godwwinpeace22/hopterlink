const stats = [
  {
    value: "00+",
    label: "Active Providers",
  },
  {
    value: "00+",
    label: "Jobs Completed",
  },
  {
    value: "4.8/5",
    label: "Average Rating",
  },
  {
    value: "98%",
    label: "Satisfaction Rate",
  },
];

export default function AboutStats() {
  return (
    <section className="bg-white border-y border-gray-200 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl sm:text-5xl font-bold text-black mb-2">
                {stat.value}
              </p>
              <p className="text-[#717182] text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
