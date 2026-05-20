import { ChevronDownIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { IEvent } from '@/types/interface';

interface EventFilterDropdownProps {
  assignEvents: IEvent[];
  selectedEvent: IEvent | null;
  onSelectEvent: (event: IEvent | null) => void;
  allEventsLabel?: string;
}

export default function EventFilterDropdown({
  assignEvents,
  selectedEvent,
  onSelectEvent,
  allEventsLabel = 'All Events',
}: EventFilterDropdownProps) {
  if (!assignEvents || assignEvents.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="h-10 px-4 rounded-xl border-2 border-blue-200 hover:border-blue-400 text-sm font-medium text-gray-700 transition-all duration-200 shadow-sm min-w-[180px] justify-between"
        >
          <span className="truncate max-w-[140px]">
            {selectedEvent ? selectedEvent.title : allEventsLabel}
          </span>
          <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 rounded-xl border border-blue-100 shadow-lg">
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
          Filter by Event
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onSelectEvent(null)}
          className={`cursor-pointer rounded-lg mx-1 px-3 py-2 text-sm transition-colors ${
            !selectedEvent ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center gap-2">
            {!selectedEvent && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />}
            {allEventsLabel}
            <span className="ml-auto text-xs text-gray-400">({assignEvents.length})</span>
          </span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {assignEvents.map((event: IEvent) => (
          <DropdownMenuItem
            key={event.eventCode}
            onClick={() => onSelectEvent(event)}
            className={`cursor-pointer rounded-lg mx-1 px-3 py-2 text-sm transition-colors ${
              selectedEvent?.eventCode === event.eventCode
                ? 'bg-blue-50 text-blue-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2 w-full">
              {selectedEvent?.eventCode === event.eventCode && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 shrink-0" />
              )}
              <span className="truncate flex-1">{event.title}</span>
              <span className="ml-auto text-xs text-gray-400 font-mono shrink-0">{event.eventCode}</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
