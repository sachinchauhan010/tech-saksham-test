import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3, MapPin } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#153fbe] via-[#1b44c2] to-[#2d2f99] px-4 pb-20 pt-14 text-white sm:px-6 md:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_0%,rgba(255,255,255,0.12),transparent_38%)]" />
      <div className="pointer-events-none absolute -right-32 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl text-center">
        <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[13px] font-semibold tracking-wide">
          <span className="h-2 w-2 rounded-full bg-cyan-300" />
          NICSI Product Business Division (PBD) Initiative
        </p>
        <h1 className="mt-6 text-4xl font-bold leading-tight text-[#c8f1ff] sm:text-5xl md:text-7xl">Tech Saksham</h1>
        <h2 className="mx-auto mt-4 max-w-5xl text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
          Empowering Digital Governance through Emerging Technologies
        </h2>
        <p className="mx-auto mt-4 max-w-5xl text-sm text-[#b5d8ff] sm:text-base md:text-xl">
          A "Digital Excellence Programme" Workshop Series on diverse technology domains
        </p>

        <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row mx-auto">
          {/* <Link
            href="/register"
            className="inline-flex w-full max-w-[280px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-semibold text-[#2052cb] transition hover:bg-[#f0f5ff]"
            className="inline-flex w-full max-w-[280px] items-center justify-center gap-2 rounded-2xl border border-white/30 bg-transparent px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Register as Delegate <ArrowRight className="h-4 w-4" />
          </Link> */}
          <Link
            href="/login"
            className="inline-flex w-full max-w-[280px] items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-base font-semibold text-[#2052cb] transition hover:bg-[#f0f5ff]"

          >
            Login to Live Questions <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-6 left-0 right-0 h-10 rounded-t-[100%] bg-[#eef2f5]" />
    </section>
  );
}
