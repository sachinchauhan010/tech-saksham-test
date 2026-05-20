'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TechSakshamIDCard } from '@/components/tech-saksham-id-card';
import EventFilterDropdown from '@/components/admin/EventFilterDropdown';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { toJpeg } from 'html-to-image';
import { DownloadIcon } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAppSelector } from '@/redux/hooks';
import { IUser, IEvent } from '@/types/interface';

// ── PDF layout ────────────────────────────────────────────────────────────────
const PAGE_W = 210;   // A4 width  (mm)
const PAGE_H = 297;   // A4 height (mm)
const CARD_W_MM = 88;    // card width  — slightly wider so 2 fit with margins
const CARD_H_MM = CARD_W_MM * (538 / 340); // ~139.3 mm — preserves aspect ratio

// Single-card centre position
const X_OFF = (PAGE_W - CARD_W_MM) / 2;
const Y_OFF = (PAGE_H - CARD_H_MM) / 2;

// 2×2 grid positions (4 cards per A4 page) ──────────────────────────────────
// Margins: 5 mm on each side, 4 mm gutter between columns / rows
const MARGIN_X = 5;   // mm — left & right page margin
const MARGIN_Y = 8;   // mm — top & bottom page margin
const GUTTER_X = 6;   // mm — horizontal gap between the two columns
const GUTTER_Y = 6;   // mm — vertical   gap between the two rows

// Recompute card width so two columns fit exactly inside the margins
const BULK_CARD_W = (PAGE_W - MARGIN_X * 2 - GUTTER_X) / 2;          // ~97 mm
const BULK_CARD_H = BULK_CARD_W * (538 / 340);                         // ~153 mm — too tall for 2 rows
// If 2 rows of BULK_CARD_H don't fit, shrink to fit height instead
const MAX_CARD_H = (PAGE_H - MARGIN_Y * 2 - GUTTER_Y) / 2;           // ~(297-16-6)/2 = 137.5 mm
const FINAL_CARD_H = Math.min(BULK_CARD_H, MAX_CARD_H);
const FINAL_CARD_W = FINAL_CARD_H * (340 / 538);                       // keep aspect ratio

// Build the 4 corner positions (col 0/1, row 0/1)
const GRID_POSITIONS = [0, 1].flatMap(row =>
  [0, 1].map(col => ({
    x: MARGIN_X + col * (FINAL_CARD_W + GUTTER_X),
    y: MARGIN_Y + row * (FINAL_CARD_H + GUTTER_Y),
  }))
); // [{col0,row0}, {col1,row0}, {col0,row1}, {col1,row1}]


/**
 * Capture a card element as a compressed JPEG data URL.
 * Two passes: first warms up fonts/images, second is the real capture.
 */
async function captureCard(element: HTMLElement, pixelRatio = 2): Promise<string> {
  const opts = {
    width: 340,
    height: 538,
    pixelRatio,
    quality: 0.88,          // JPEG quality 0–1  (0.88 ≈ excellent/print-ready)
    backgroundColor: '#ffffff',
    skipFonts: false,
  };
  await toJpeg(element, opts);   // warm-up pass
  return toJpeg(element, opts);  // real capture
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AdminIDCardsPage() {
  const { user } = useAppSelector((s) => s.user);
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignEvents, setAssignEvent] = useState<IEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  useEffect(() => { fetchAssignEvent(); }, []);

  useEffect(() => {
    const id = setTimeout(fetchUsers, 150);
    return () => clearTimeout(id);
  }, [searchQuery, assignEvents, selectedEvent]);

  // ── API ───────────────────────────────────────────────────────────────────

  const fetchAssignEvent = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/assigned-event');
      if (data.success) setAssignEvent(data.events);
      else toast.error(data.message || 'Failed to load assigned events');
    } catch {
      toast.error('Failed to load assigned events');
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const eventCodes = selectedEvent
        ? [selectedEvent.eventCode]
        : assignEvents.map((e: IEvent) => e.eventCode);

      if (eventCodes.length === 0) { setUsers([]); return; }

      const { data } = await apiClient.get('/api/admin/users', {
        params: { ...(searchQuery && { search: searchQuery }), managedEvents: eventCodes },
        paramsSerializer: (params) => {
          const s = new URLSearchParams();
          Object.entries(params).forEach(([key, val]) => {
            if (Array.isArray(val)) val.forEach((v) => s.append(key, v));
            else s.append(key, val as string);
          });
          return s.toString();
        },
      });

      if (data.success) {
        setUsers(data.data);
        if (searchQuery) toast.success(`Found ${data.data.length} participants matching "${searchQuery}"`);
      } else {
        throw new Error(data.message || 'Failed to load participants');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const activeEvents = selectedEvent ? [selectedEvent] : assignEvents;

  const resolveEventsForUser = (u: IUser): IEvent[] =>
    (u.eventApplied || [])
      .map((a: any) => activeEvents.find((ae) => ae.eventCode === a.eventCode))
      .filter((e): e is IEvent => !!e);

  // ── Get the rendered DOM element for a user's card ────────────────────────
  const getCardElement = (userId: string): HTMLElement | null =>
    document.getElementById(`id-card-${userId}`);

  // ── Single PDF: one card centred on an A4 page (JPEG, compressed) ──────────
  const downloadSingleAsPDF = async (u: IUser, evt: IEvent) => {
    const el = getCardElement(`${u._id}-${evt.eventCode}`);
    if (!el) { toast.error('Card element not found'); return; }

    setDownloadingId(`${u._id}-${evt.eventCode}`);
    try {
      // pixelRatio: 2 → good quality, much smaller than 3×
      const imgData = await captureCard(el, 2);

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      pdf.addImage(imgData, 'JPEG', X_OFF, Y_OFF, CARD_W_MM, CARD_H_MM, undefined, 'FAST');

      pdf.save(`id-card-${u.name.replace(/\s+/g, '-').toLowerCase()}-${u.userId}-${evt.eventCode}.pdf`);
      toast.success(`Downloaded ID card for ${u.name} (${evt.eventCode})`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to generate PDF for ${u.name}`);
    } finally {
      setDownloadingId(null);
    }
  };

  // ── Bulk PDF: 4 cards per A4 page (2×2 grid), JPEG compressed ───────────
  const downloadAllAsPDF = async () => {
    if (users.length === 0) { toast.error('No ID cards to download'); return; }
    setDownloadingAll(true);

    try {
      const allCardsToDownload = users.flatMap(u => 
        resolveEventsForUser(u).map(evt => ({ user: u, evt, id: `${u._id}-${evt.eventCode}` }))
      );

      if (allCardsToDownload.length === 0) {
        toast.error('No events assigned to any user');
        setDownloadingAll(false);
        return;
      }

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
      const totalPages = Math.ceil(allCardsToDownload.length / 4);

      for (let i = 0; i < allCardsToDownload.length; i++) {
        const { user: u, id } = allCardsToDownload[i];
        const el = getCardElement(id);
        const pos = GRID_POSITIONS[i % 4];          // 0-3 slot on current page

        if (!el) {
          console.warn(`Card element not found for ${u.name}, skipping`);
          continue;
        }

        // New page every 4 cards (not on the very first card)
        if (i > 0 && i % 4 === 0) pdf.addPage();

        // Capture at pixelRatio 1.5 for bulk — fast + small enough for 4 per page
        const imgData = await captureCard(el, 1.5);
        pdf.addImage(imgData, 'JPEG', pos.x, pos.y, FINAL_CARD_W, FINAL_CARD_H, undefined, 'FAST');
      }

      const date = new Date().toISOString().split('T')[0];
      pdf.save(`all-id-cards-${date}.pdf`);
      toast.success(`Downloaded ${allCardsToDownload.length} ID cards across ${totalPages} page(s)`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate bulk PDF. Please try again.');
    } finally {
      setDownloadingAll(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0f5fc3]">ID Cards</h1>
        <p className="mt-1 text-muted-foreground">Generate and download delegate ID cards</p>
      </div>

      {/* Toolbar */}
      <div className="mb-8 flex flex-col lg:flex-row justify-between items-center gap-4 px-3">
        <div className="flex gap-3 items-center w-full">

          {/* Search */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <Input
              placeholder="Search by Name, Email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              className="pl-10 pr-10 h-10 rounded-full border-2 border-blue-200 focus:border-blue-300 focus:ring-1 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#0f5fc3]"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Search button */}
          <Button
            onClick={fetchUsers}
            disabled={isLoading}
            className="h-10 px-6 cursor-pointer font-medium"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>

          {/* Event filter dropdown */}
          <EventFilterDropdown
            assignEvents={assignEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
          />
        </div>

        {/* Download All */}
        {users.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={downloadAllAsPDF}
              disabled={downloadingAll || downloadingId !== null}
              className="h-10 px-6 rounded-xl bg-green-700 hover:bg-green-800 text-white font-medium transition-colors flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              {downloadingAll ? 'Downloading All...' : `Download All (${users.length})`}
            </Button>
          </div>
        )}
      </div>

      {/* Card grid */}
      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="mb-4 text-muted-foreground">
            No participants found. Search or fetch all participants to display ID cards.
          </p>
          <Button onClick={fetchUsers} disabled={isLoading}>
            Fetch All Participants
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-10 md:grid-cols-1 lg:grid-cols-2 2xl:grid-cols-2">
          {users.flatMap((u) => {
            const userEvents = resolveEventsForUser(u);
            
            return userEvents.map((evt) => {
              const uniqueId = `${u._id}-${evt.eventCode}`;
              
              return (
                <div key={uniqueId} className="flex flex-col justify-between items-center gap-3">
                  {/*
                    IMPORTANT: The id here is what captureCard() looks up.
                    The div must be exactly 340×538 with no extra wrapper clipping.
                    overflow-hidden on a parent will break the capture — keep it visible.
                  */}
                  <div
                    id={`id-card-${uniqueId}`}
                    style={{
                      width: '340px',
                      height: '538px',
                      flexShrink: 0,
                      // Isolate the element so toPng captures only this card
                      position: 'relative',
                      overflow: 'hidden',
                      borderRadius: '20px',
                    }}
                  >
                    <TechSakshamIDCard
                      user={u}
                      appliedEvent={evt}
                    />
                  </div>

                  <Button
                    onClick={() => downloadSingleAsPDF(u, evt)}
                    disabled={downloadingId === uniqueId}
                    className="w-[340px] bg-blue-600 hover:bg-blue-700"
                  >
                    {downloadingId === uniqueId ? 'Downloading...' : 'Download PDF'}
                  </Button>
                </div>
              );
            });
          })}
        </div>
      )}
    </section>
  );
}