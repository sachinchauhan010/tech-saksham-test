'use client';

import { AboutSection } from '@/components/home/about-section';
import EventSection from '@/components/home/event-section';
import { FooterCtaSection } from '@/components/home/footer-cta-section';
import { HeroSection } from '@/components/home/hero-section';
import { ObjectivesSection } from '@/components/home/objectives-section';
import { QaStepsSection } from '@/components/home/qa-steps-section';
import { SessionsSection } from '@/components/home/sessions-section';

export default function Home() {
  return (
    <div className="bg-[#eef2f5] text-slate-800">
      <main className="w-full px-4 py-8 sm:px-6">
        <HeroSection />
        <AboutSection />
        <EventSection />
        <ObjectivesSection />
        <SessionsSection />
        <QaStepsSection />
        <FooterCtaSection />
      </main>
    </div>
  );
}
