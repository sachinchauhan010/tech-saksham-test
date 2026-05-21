'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IUser } from '@/types/interface';
import apiClient from '@/lib/api-client';
import { ROLE } from '@/lib/enum';
import { IEvent } from '@/types/interface';
import { LocateFixedIcon, LocateIcon, MapPin, Calendar } from 'lucide-react';

interface TechSakshamIDCardProps {
  user: IUser;
  appliedEvent: IEvent;
}

export function TechSakshamIDCard({ user, appliedEvent }: TechSakshamIDCardProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  useEffect(() => {
    generateQRCode();
  }, [user.userId]);

  const generateQRCode = async () => {
    setQrLoading(true);
    setQrError(null);

    try {
      const { data } = await apiClient.post('/api/qr/generate', { userId: user.userId, email: user.email });

      if (data.success) {
        setQrImage(data.qrImage);
      } else {
        setQrError(data.error || 'Failed to generate QR code');
      }
    } catch (error) {
      setQrError('Network error. Please try again.');
    } finally {
      setQrLoading(false);
    }
  };

  const bgImage = user.role === ROLE.GUEST
    ? (appliedEvent?.guestIdCard || '/tech-saksham-guest-id-card.png')
    : user.role === ROLE.ORGANIZER
    ? (appliedEvent?.organizerIdCard || '/tech-saksham-org-id-card.png')
    : (appliedEvent?.delegateIdCard || '/tech-saksham-id-card.png');

  return (
    <div
      className="relative w-[340px] h-[538px] overflow-hidden rounded-[20px] bg-white shadow-[0_20px_60px_rgba(60,70,160,0.35),0_4px_16px_rgba(0,0,0,0.18)]"
      aria-label={`ID card ${user.name}`}
    >
      <Image
        src={bgImage}
        alt="ID Card Background"
        fill
        priority
        sizes="340px"
        className="object-cover"
      />


      <div className="absolute inset-0 z-10 pointer-events-none flex flex-col items-center justify-center ">
        <div className="text-center max-w-[280px] mx-auto opacity-0 pointer-events-none">
          <div className="text-gray-50 font-medium break-words text-[14px]">
            {appliedEvent?.sessions?.map((session, index) => (
              <span key={index}>
                {session.title.toUpperCase()}
                {index < appliedEvent.sessions.length - 1 && <span> | </span>}
              </span>
            ))}
          </div>
        </div>
        <div className="text-[10px] text-center text-white flex flex-col items-center justify-center gap-0.5 opacity-0 pointer-events-none">
          <div className='flex justify-center items-center'>
            <div className='flex items-center justify-center gap-0.5'>
              <Calendar size={10} />
              <span>
                {appliedEvent?.startDate
                  ? new Date(appliedEvent.startDate).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })
                  : 'TBA'}
              </span>
            </div>
            <div>
              <span>| {appliedEvent?.startDate ? new Date(appliedEvent.startDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBA'} to {appliedEvent?.endDate ? new Date(appliedEvent.endDate).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'TBA'}</span>
            </div>
          </div>
          <div className="text-[11px] text-white w-[180px] flex items-start justify-center leading-3">
            <MapPin size={10} />
            <span className="whitespace-pre-line">{`${appliedEvent?.location?.venueName}, ${appliedEvent?.location?.city}`}</span>
          </div>
        </div>
        {/* User details (kept above the QR so nothing overlaps) */}

        <div className="text-center max-w-[65%] mt-24 mx-auto flex flex-col justify-between items-center">
          {/* <div className=" bg-green-300 absolute left-0 right-0 bottom-[150px] text-center max-w-[65%] mx-auto flex flex-col justify-between items-center"> */}

          <div className="text-[18px] font-extrabold leading-[1] text-[#1e2e7a]">
            {user.name}
          </div>
          <div className="mt-[2px] text-[14px] font-bold leading-[0.9] tracking-[0.03em] text-[#5e6aa6]">
            {user.department}
            {/* NICSI Jammu & Kashmir Delhi New Delhi */}
          </div>
          <div className="mt-[2px] text-[12px] font-semibold tracking-[0.08em] text-[#1a56aa]">
            {user.userId}
          </div>
          {/* <div>
            {appliedEvent?.title}
            {appliedEvent?.location?.venueName && <br />}
            {appliedEvent?.location?.venueName}
          </div> */}
        </div>

        <div
          className="absolute left-1/2 -translate-x-1/2 bottom-[72px] flex items-center justify-center w-[76px] h-[76px] rounded-[10px] bg-white shadow-[0_6px_18px_rgba(30,46,122,0.12)] pointer-events-auto"
          aria-label="Dynamic QR code"
        >
          {qrLoading ? (
            <div className="w-[26px] h-[26px] rounded-full border-[3px] border-blue-200 border-t-blue-700 animate-spin" />
          ) : qrError ? (
            <div className="flex flex-col items-center gap-1 text-center w-[78px]">
              <div className="text-[10px] font-extrabold text-red-700">QR error</div>
              <button
                type="button"
                onClick={generateQRCode}
                className="text-[10px] font-bold text-[#1a56aa] underline bg-transparent p-0 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : qrImage ? (
            <Image
              src={qrImage}
              alt="Login QR Code"
              width={68}
              height={68}
              className="w-[78px] h-[78px] rounded-[4px]"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}