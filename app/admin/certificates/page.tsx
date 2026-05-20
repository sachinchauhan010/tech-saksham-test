'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import { Download, Search, X, Award, Hash, Building2, User, Layers } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { IEvent } from '@/types/interface';
import EventFilterDropdown from '@/components/admin/EventFilterDropdown';

interface User {
  _id: string;
  userId: string;
  name: string;
  department: string;
  eventApplied?: { eventCode: string }[];
}

/** Compress an image URL to a small base64 JPEG at the given quality (0–1) */
async function getCompressedBase64(
  src: string,
  quality = 0.6,
  maxWidth = 1400,
): Promise<{ dataUrl: string; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.naturalWidth);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, w, h);
      resolve({ dataUrl: canvas.toDataURL('image/jpeg', quality), w, h });
    };
    img.onerror = reject;
    img.src = src;
  });
}

/** Build a single PDF page for one user, reusing the pre-compressed image data */
function renderPage(
  pdf: jsPDF,
  userName: string,
  compressedDataUrl: string,
) {
  pdf.addImage(compressedDataUrl, 'JPEG', 0, 0, 297, 210);
  pdf.setFont('Times', 'Bold');
  pdf.setFontSize(20);
  pdf.setTextColor(30, 46, 122);
  const splitName = pdf.splitTextToSize(userName, 180);
  pdf.text(splitName, 148.5, 116, { align: 'center' });
}

export default function AdminCertificates() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assignEvents, setAssignEvent] = useState<IEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  useEffect(() => {
    fetchAssignEvent();
  }, []);

  useEffect(() => {
    const id = setTimeout(fetchUsers, 150);
    return () => clearTimeout(id);
  }, [searchQuery, assignEvents, selectedEvent]);

  const fetchAssignEvent = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/assigned-event');
      if (data.success) {
        setAssignEvent(data.events);
      } else {
        toast.error(data.message || 'Failed to load assigned events');
      }
    } catch {
      toast.error('Failed to load assigned events');
    }
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const eventCodes = selectedEvent
        ? [selectedEvent.eventCode]
        : assignEvents.map((e) => e.eventCode);

      if (eventCodes.length === 0) {
        setUsers([]);
        return;
      }

      const { data } = await apiClient.get('/api/admin/users', {
        params: {
          ...(searchQuery && { search: searchQuery }),
          managedEvents: eventCodes,
          limit: 500,
        },
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
      } else {
        throw new Error(data.message || 'Failed to load participants');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to load participants');
    } finally {
      setIsLoading(false);
    }
  };

  const activeEvents = selectedEvent ? [selectedEvent] : assignEvents;

  /** Resolve which events a user participated in (intersect with activeEvents) */
  const getUserEvents = (user: User): IEvent[] => {
    if (!user.eventApplied?.length) return [];
    return activeEvents.filter((evt) =>
      user.eventApplied!.some((a) => a.eventCode === evt.eventCode)
    );
  };

  /** Pre-compress templates for the events needed to avoid repeatedly downloading the same image */
  const getEventTemplates = async (eventsToProcess: IEvent[]) => {
    const templates: Record<string, string> = {};
    for (const evt of eventsToProcess) {
      if (!templates[evt.eventCode]) {
        try {
          const bgUrl = evt.certificateTemplate || '/tech-saksham-certificate.png';
          const { dataUrl } = await getCompressedBase64(bgUrl, 0.6, 1400);
          templates[evt.eventCode] = dataUrl;
        } catch (err) {
          console.error(`Failed to load template for ${evt.eventCode}`, err);
          // Fallback on error
          const { dataUrl } = await getCompressedBase64('/tech-saksham-certificate.png', 0.6, 1400);
          templates[evt.eventCode] = dataUrl;
        }
      }
    }
    return templates;
  };

  /* ---------------- SINGLE DOWNLOAD ---------------- */
  const downloadSingleAsPDF = async (user: User, eventToDownload: IEvent) => {
    setDownloadingId(`${user._id}-${eventToDownload.eventCode}`);
    try {
      const templates = await getEventTemplates([eventToDownload]);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true, // enables FlateDecode compression inside the PDF
      });

      renderPage(pdf, user.name, templates[eventToDownload.eventCode]);

      const safeName = user.name.replace(/\s+/g, '-').toLowerCase();
      pdf.save(`certificate-${safeName}.pdf`);
      toast.success(`Downloaded certificate for ${user.name}`);
    } catch (err) {
      console.error(err);
      toast.error('Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  /* ---------------- DOWNLOAD ALL ---------------- */
  const downloadAllAsPDF = async () => {
    if (users.length === 0) return;
    setDownloadingAll(true);
    try {
      // Find all unique events among users
      const relevantEventCodes = new Set<string>();
      users.forEach((u) => getUserEvents(u).forEach((e) => relevantEventCodes.add(e.eventCode)));
      const relevantEvents = assignEvents.filter((e) => relevantEventCodes.has(e.eventCode));

      if (relevantEvents.length === 0) {
        toast.error('No users have assigned events');
        setDownloadingAll(false);
        return;
      }

      // Pre-fetch and compress all needed templates
      const templates = await getEventTemplates(relevantEvents);

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      let pageAdded = false;
      for (const user of users) {
        const userEvents = getUserEvents(user);
        for (const evt of userEvents) {
          if (pageAdded) pdf.addPage();
          renderPage(pdf, user.name, templates[evt.eventCode]);
          pageAdded = true;
        }
      }

      if (!pageAdded) {
        toast.error('Could not generate any certificates');
        return;
      }

      pdf.save('all-certificates.pdf');
      toast.success(`Downloaded certificates for ${users.length} participants`);
    } catch (err) {
      console.error(err);
      toast.error('Bulk download failed');
    } finally {
      setDownloadingAll(false);
    }
  };

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0f5fc3]">Certificates</h1>
          <p className="mt-1 text-muted-foreground">
            Generate and download participant certificates
          </p>
        </div>
      </div>

      {/* Search + Event Filter */}
      <div className="mb-8 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by name, email or ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="pl-9 pr-9 h-10 rounded-full border-2 border-blue-200 focus:border-blue-400 bg-white shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Button
          onClick={fetchUsers}
          disabled={isLoading}
          className="h-10 px-6 rounded-full shrink-0"
        >
          {isLoading ? 'Searching…' : 'Search'}
        </Button>

        <EventFilterDropdown
          assignEvents={assignEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
        />

        {users.length > 0 && (
          <Button
            onClick={downloadAllAsPDF}
            disabled={downloadingAll || downloadingId !== null}
            className="h-10 px-5 rounded-xl bg-green-700 hover:bg-green-800 text-white font-medium flex items-center gap-2 shrink-0"
          >
            <Layers className="h-4 w-4" />
            {downloadingAll ? 'Downloading…' : `Download All (${users.length})`}
          </Button>
        )}
      </div>

      {/* Empty State */}
      {users.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">
            No participants found. Search or fetch all participants to display certificates.
          </p>
          <Button onClick={fetchUsers} disabled={isLoading}>
            Fetch All Participants
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {users.flatMap((user) => {
            const userEvents = getUserEvents(user);
            
            return userEvents.map((evt) => {
              const uniqueId = `${user._id}-${evt.eventCode}`;
              const isDownloading = downloadingId === uniqueId;

              return (
                <Card
                  key={uniqueId}
                  className="relative overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200 group"
                >
                  {/* Top accent bar */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-[#0f5fc3] to-[#3b82f6]" />

                  <div className="p-5 space-y-4">
                    {/* Avatar + Name */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-11 w-11 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                        <User className="h-5 w-5 text-[#0f5fc3]" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-base font-semibold text-slate-900 leading-tight truncate">
                          {user.name}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {user.userId}
                        </p>
                      </div>
                    </div>

                    {/* Department */}
                    {user.department && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.department}</span>
                      </div>
                    )}

                    {/* Event Tag */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 gap-2">
                        <span className="text-xs font-medium text-blue-800 truncate flex-1">
                          {evt.title}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-mono border-blue-200 text-blue-600 bg-white shrink-0 px-1.5 py-0"
                        >
                          {evt.eventCode}
                        </Badge>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100" />

                    {/* Download button */}
                    <Button
                      onClick={() => downloadSingleAsPDF(user, evt)}
                      disabled={isDownloading || downloadingAll}
                      className="w-full h-9 rounded-lg text-sm font-medium flex items-center justify-center gap-2 bg-[#0f5fc3] hover:bg-[#0d4fa3] text-white transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {isDownloading ? 'Generating…' : 'Download Certificate'}
                    </Button>
                  </div>
                </Card>
              );
            });
          })}
        </div>
      )}
    </section>
  );
}