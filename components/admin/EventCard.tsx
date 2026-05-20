import React from 'react';
import { Eye, Edit2, Trash2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface EventCardProps {
  event: any;
  onView: (event: any) => void;
  onEdit: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  getStatusBadge: (status: string) => string;
}

export default function EventCard({ event, onView, onEdit, onDelete, getStatusBadge }: EventCardProps) {
  const safeFormatDate = (date: any) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return isNaN(d.getTime()) ? 'Invalid Date' : format(d, 'MMM dd, yyyy');
  };

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-start mb-2">
        <div className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100">
          {event.eventCode}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
          {event.status}
        </div>
      </div>
      
      <h3 className="font-bold text-lg mb-2 line-clamp-2" title={event.title}>{event.title}</h3>
      
      <div className="space-y-2 mt-auto text-sm text-gray-600 mb-4">
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4"/> {safeFormatDate(event.startDate)} - {safeFormatDate(event.endDate)}</div>
      </div>
      
      <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
        <Button variant="outline" size="icon" onClick={() => onView(event)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => onEdit(event._id)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto" onClick={() => onDelete(event._id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
