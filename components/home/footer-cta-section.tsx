import Link from 'next/link';
import { ArrowRight, MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export function FooterCtaSection() {
  return (
    <>
      <footer className="border-t-4 border-[#11abe7] bg-gradient-to-r from-[#1d3ea8] to-[#263ba4] px-4 py-10 text-white sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          <div>
            <h4 className="text-2xl font-bold">Tech Saksham</h4>
            <p className="mt-3 text-sm text-blue-100">
              Pan-India Workshop Series empowering digital governance through interactive learning and engagement.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-md bg-white/10 px-2 py-1">MeitY</span>
              <span className="rounded-md bg-white/10 px-2 py-1">NICSI</span>
              <span className="rounded-md bg-white/10 px-2 py-1">Digital India</span>
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-bold">Contact</h4>
            <div className="mt-3 space-y-3 text-sm text-blue-100">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                NICSI, New Delhi, India
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91-11-22900525
              </p>
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                8527625551
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                info-nicsi@nic.in, mdnicsi@nic.in
              </p>
            </div>
          </div>
          <div>
            <h4 className="text-2xl font-bold">Quick Links</h4>
            <div className="mt-3 space-y-2 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                <Link href={"https://nicsi.nic.in/nicsi/"}>https://nicsi.nic.in/nicsi</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-8 max-w-6xl border-t border-white/15 pt-4 text-center text-xs text-blue-100">
          © 2026 Government of India. All rights reserved.
        </div>
      </footer>
    </>
  );
}
