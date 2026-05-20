import { objectives } from "./home-data";

export function ObjectivesSection() {
  return (
    <section className="mx-auto w-full py-14 md:py-20">
      {/* Heading */}
      <div className="mx-auto max-w-4xl text-center">
        <span className="inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#2091dc]">
          Workshop Vision
        </span>

        <h3 className="mt-5 text-3xl font-bold tracking-tight text-[#111f3a] sm:text-5xl">
          Objectives of the Programme
        </h3>

        <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-[#2091dc] to-[#2db1e6]" />

        <p className="mx-auto mt-6 max-w-3xl text-[15px] leading-8 text-slate-500 sm:text-base">
          The evolving demands of digital governance and the rapid adoption of
          emerging technologies require a future-ready ecosystem focused on
          awareness, collaboration, innovation, and structured capacity
          building.
        </p>
      </div>

      {/* Cards */}
      <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {objectives.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.number}
              className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              {/* Background Glow */}
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#2091dc]/5 blur-3xl transition-all duration-500 group-hover:bg-[#2091dc]/10" />

              {/* Number */}
              <div className="absolute right-5 top-5 text-5xl font-black tracking-tight text-slate-100">
                0{index + 1}
              </div>

              {/* Icon */}
              <div className="relative z-10 inline-flex rounded-2xl bg-gradient-to-br from-[#2091dc] to-[#2db1e6] p-3 text-white shadow-lg shadow-blue-100 transition-transform duration-300 group-hover:scale-110">
                <Icon className="h-6 w-6" />
              </div>

              {/* Content */}
              <div className="relative z-10 mt-6">
                <h4 className="text-xl font-bold leading-snug text-[#111f3a] sm:text-2xl">
                  {item.title}
                </h4>

                <p className="mt-4 text-[15px] leading-7 text-slate-500">
                  {item.description}
                </p>
              </div>

              {/* Bottom Accent */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-[#2091dc] to-[#2db1e6] transition-all duration-500 group-hover:w-full" />
            </div>
          );
        })}
      </div>
    </section>
  );
}