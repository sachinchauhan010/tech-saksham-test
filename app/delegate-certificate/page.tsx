'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import apiClient from "@/lib/api-client";
import { IEvent } from "@/types/interface";
import { Calendar, Download, Lock } from "lucide-react";
import ComponentWrapper from "@/components/ComponentWrapper";

export default function CertificatePage() {
  const [downloading, setDownloading] = useState(false);
  const [certificateSettings, setCertificateSettings] = useState<{
    enabled: boolean;
    allowDownload: boolean;
    message: string;
  }>({ enabled: true, allowDownload: true, message: '' });
  const [appliedEvent, setAppliedEvent] = useState<IEvent[]>([]);
  const { user } = useAppSelector((state) => state.user);

  const fetchCertificatePermissions = async () => {
    try {
      const response = await apiClient.get('/api/delegate/certificate-permissions');
      const data = response.data;
      if (data.success) {
        setCertificateSettings(data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadCertificate = async (eventName: string) => {
    if (!user) {
      toast.error('User not found');
      return;
    }

    setDownloading(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Load the original image
      const img = new Image();
      img.src = '/tech-saksham-certificate.png';
      await new Promise((resolve) => { img.onload = resolve; });

      // Draw onto a canvas at 150dpi equivalent — compresses from full resolution
      const canvas = document.createElement('canvas');
      canvas.width = 1754;  // A4 landscape at 150dpi
      canvas.height = 1240;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Export as JPEG at 0.82 quality — biggest size reduction
      const compressedImg = canvas.toDataURL('image/jpeg', 0.82);

      pdf.addImage(compressedImg, 'JPEG', 0, 0, 297, 210);
      pdf.setFont('Times', 'Bold');
      pdf.setFontSize(16);
      pdf.setTextColor(30, 46, 122);

      const splitName = pdf.splitTextToSize(user.name, 180);
      pdf.text(splitName, 148.5, 116, { align: 'center' });

      pdf.save(`${eventName.replace(/\s+/g, '-')}-certificate.pdf`);
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate certificate');
    } finally {
      setDownloading(false);
    }
  };

  const fetchAppliedEvent = async () => {
    try {
      const { data } = await apiClient.get(`/api/event/applied-events`);
      if (data?.success && data?.events) {
        setAppliedEvent(data.events);
      }
    } catch (error) {
      console.error('Error fetching applied events:', error);
    }
  };

  useEffect(() => {
    fetchAppliedEvent();
  }, []);

  useEffect(() => {
    if (user) fetchCertificatePermissions();
  }, [user]);

  if (!certificateSettings.enabled) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border">
          <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Certificates Unavailable</h2>
          <p className="text-gray-600 max-w-xs mx-auto">
            {certificateSettings.message || 'The certificate portal is currently closed. Please check back later.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ComponentWrapper>
      <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Your Certificates
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              View and download your official Tech Saksham participation certificates.
            </p>
          </header>

          <div className="grid gap-8">
            {appliedEvent.length > 0 ? (
              appliedEvent.map((event) => (
                <div
                  key={event._id}
                  className="group bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md"
                >
                  <div className="p-6 sm:p-10 flex flex-col md:flex-row md:items-center gap-8">

                    {/* Left: Event Details */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                          Official Recognition
                        </span>
                        <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                          {event.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          {event.startDate ? new Date(event.startDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'Date TBD'}
                        </div>
                        <div className="font-medium text-slate-700">
                          ID: <span className="text-slate-500">{user?.userId}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Action Area */}
                    <div className="flex flex-col items-center md:items-end justify-center pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-slate-100 md:pl-8">
                      {event.isCertificateIssue ? (
                        <Button
                          onClick={() => handleDownloadCertificate(event.title)}
                          disabled={downloading}
                          size="lg"
                          className="w-full md:w-auto bg-[#0f5fc3] hover:bg-[#0d52a8] text-white px-8 rounded-xl shadow-lg shadow-blue-200 transition-transform active:scale-95"
                        >
                          {downloading ? (
                            'Generating PDF...'
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" /> Download Certificate
                            </>
                          )}
                        </Button>
                      ) : (
                        <div className="text-center md:text-right">
                          <p className="text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-lg">
                            Processing Certificate
                          </p>
                          <p className="text-xs text-slate-400 mt-2 italic">
                            Available once event evaluation is complete.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <p className="text-slate-500">No events found in your record.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ComponentWrapper>
  );
}