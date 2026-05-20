'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { TechSakshamIDCard } from '@/components/tech-saksham-id-card';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { toPng } from 'html-to-image';
import { IEvent, IUser } from '@/types/interface';
import { useAppSelector } from '@/redux/hooks';
import apiClient from '@/lib/api-client';
import { Download, MapPin, CreditCard, Clock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import ComponentWrapper from '@/components/ComponentWrapper';

// ── PDF constants (untouched) ─────────────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const CARD_W_MM = 85;
const CARD_H_MM = CARD_W_MM * (538 / 340);
const X_OFF = (PAGE_W - CARD_W_MM) / 2;
const Y_OFF = (PAGE_H - CARD_H_MM) / 2;

async function captureCard(element: HTMLElement): Promise<string> {
  return toPng(element, {
    width: 340,
    height: 538,
    pixelRatio: 3,
    backgroundColor: '#ffffff',
    style: { borderRadius: '20px' },
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function IDCardsPage() {
  const { user } = useAppSelector((state) => state.user);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [appliedEvent, setAppliedEvent] = useState<IEvent[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const downloadAsPDF = async (eventId?: string) => {
    if (!user) return;

    const targetEventId = eventId || appliedEvent.find(event => event.isIdCardIssue)?._id;
    if (!targetEventId) { toast.error('No ID card available for download'); return; }

    const element = document.getElementById(`id-card-${user._id}-${targetEventId}`);
    if (!element) { toast.error('Card element not found'); return; }

    setIsDownloading(targetEventId);
    try {
      await toPng(element, { width: 340, height: 538 });
      const imgData = await captureCard(element);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', X_OFF, Y_OFF, CARD_W_MM, CARD_H_MM);
      const safeName = user.name.replace(/\s+/g, '-').toLowerCase();
      const event = appliedEvent.find(e => e._id === targetEventId);
      const eventTitle = event?.title?.replace(/\s+/g, '-').toLowerCase() || 'event';
      pdf.save(`id-card-${safeName}-${user.userId}-${eventTitle}.pdf`);
      toast.success('ID card downloaded successfully');
    } catch (error) {
      console.error('PDF error:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsDownloading(null);
    }
  };

  const fetchAppliedEvent = async () => {
    setIsFetching(true);
    try {
      const { data } = await apiClient.get(`/api/event/applied-events`);
      if (data?.success && data?.events) setAppliedEvent(data.events);
    } catch (error) {
      console.error('Error fetching applied events:', error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { fetchAppliedEvent(); }, []);

  const issuedCards = appliedEvent.filter(e => e.isIdCardIssue);
  const pendingCards = appliedEvent.filter(e => !e.isIdCardIssue);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (!user || isFetching) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1a6fd4] to-[#2db1e6] shadow-lg shadow-blue-200">
            <Loader2 className="h-7 w-7 text-white animate-spin" />
          </div>
          <p className="text-sm text-slate-500">Loading your ID cards…</p>
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────────────
  if (appliedEvent.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 px-4 py-10">
        <PageHeader issuedCount={0} totalCount={0} />
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center justify-center rounded-2xl border border-dashed border-blue-200 bg-white px-8 py-16 text-center shadow-sm">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100">
            <CreditCard className="h-8 w-8 text-[#1a6fd4]" />
          </div>
          <h3 className="text-base font-semibold text-slate-700">No events applied yet</h3>
          <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-xs">
            Once you apply to an event and your ID card is issued by the administrator, it will appear here.
          </p>
        </div>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <ComponentWrapper>

    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">

        <PageHeader issuedCount={issuedCards.length} totalCount={appliedEvent.length} />

        {/* ── Issued ID Cards ───────────────────────────────────────────────── */}
        {issuedCards.length > 0 && (
          <div className="space-y-4">
            <SectionLabel
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Ready to Download"
              color="emerald"
            />
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {issuedCards.map((event) => (
                <EventCardIssued
                  key={event._id}
                  event={event}
                  user={user as IUser}
                  isDownloading={isDownloading === event._id}
                  anyDownloading={isDownloading !== null}
                  onDownload={() => downloadAsPDF(event._id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Pending Cards ─────────────────────────────────────────────────── */}
        {pendingCards.length > 0 && (
          <div className="space-y-4">
            <SectionLabel
              icon={<Clock className="h-4 w-4" />}
              label="Pending Issuance"
              color="amber"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {pendingCards.map((event) => (
                <EventCardPending key={event._id} event={event} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
          
    </ComponentWrapper>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PageHeader({ issuedCount, totalCount }: { issuedCount: number; totalCount: number }) {
  return (
    <ComponentWrapper>

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a6fd4] to-[#2db1e6] shadow-md shadow-blue-200">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">My ID Cards</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your verified Tech Saksham identity cards</p>
        </div>
      </div>

      {totalCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold text-emerald-700">{issuedCount}</span>
            <span className="text-emerald-500 text-xs">ready</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5">
            <CreditCard className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-semibold text-blue-700">{totalCount}</span>
            <span className="text-blue-500 text-xs">total</span>
          </div>
        </div>
      )}
    </div>
    </ComponentWrapper>
  );
}

function SectionLabel({ icon, label, color }: { icon: React.ReactNode; label: string; color: 'emerald' | 'amber' }) {
  const cls = color === 'emerald'
    ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
    : 'bg-amber-50 border-amber-100 text-amber-700';
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${cls}`}>
      {icon}
      {label}
    </div>
  );
}

function EventCardIssued({
  event,
  user,
  isDownloading,
  anyDownloading,
  onDownload,
}: {
  event: IEvent;
  user: IUser;
  isDownloading: boolean;
  anyDownloading: boolean;
  onDownload: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all duration-300">
      {/* Event meta */}
      <div className="w-full">
        <p className="text-[10px] font-bold tracking-[0.16em] text-[#1a6fd4] uppercase">Tech Saksham</p>
        <h3 className="mt-0.5 text-[15px] font-semibold text-slate-800 leading-tight line-clamp-1">
          {event.title}
        </h3>
        {event.location?.venueName && (
          <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.location.venueName}</span>
          </div>
        )}
      </div>

      {/* ID Card — untouched */}
      <div
        id={`id-card-${user._id}-${event._id}`}
        style={{
          width: '340px',
          height: '538px',
          flexShrink: 0,
          maxWidth: '100%',
        }}
        className="self-center"
      >
        <TechSakshamIDCard user={user} appliedEvent={event} />
      </div>

      {/* Download button */}
      <Button
        onClick={onDownload}
        disabled={anyDownloading}
        className="w-full max-w-[340px] h-10 rounded-xl bg-gradient-to-r from-[#1a6fd4] to-[#2db1e6] hover:from-[#155bbf] hover:to-[#1a9fd4] text-white text-sm font-medium gap-2 shadow-sm shadow-blue-200 transition-all"
      >
        {isDownloading
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating PDF…</>
          : <><Download className="h-4 w-4" /> Download PDF</>}
      </Button>
    </div>
  );
}

function EventCardPending({ event }: { event: IEvent }) {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
        <AlertCircle className="h-5 w-5 text-amber-600" />
      </div>
      <div className="min-w-0">
        <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{event.title}</h4>
        {event.location?.venueName && (
          <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{event.location.venueName}</span>
          </div>
        )}
        <p className="mt-2 text-xs text-amber-700 leading-relaxed">
          Your ID card hasn't been issued yet. Contact the event administrator if you think this is an error.
        </p>
      </div>
    </div>
  );
}