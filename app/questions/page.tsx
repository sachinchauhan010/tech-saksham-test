'use client';

import { useState, useEffect } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

import apiClient from '@/lib/api-client';
import { IEvent } from '@/types/interface';
import { useAppSelector } from '@/redux/hooks';
import { useToast } from '@/hooks/use-toast';
import ComponentWrapper from '@/components/ComponentWrapper';
import UserEventCard from '@/components/UserEventCard';

export default function QuestionsEventSelectionPage() {
  const [todaysEvents, setTodaysEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAppSelector((state) => state.user);
  const router = useRouter();
  const toast = useToast();

  // Wait for user to be loaded before fetching,
  // so the auto-redirect check works correctly
  useEffect(() => {
    if (user !== undefined) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data } = await apiClient.get('/api/event');

      if (data.success) {
        const { upcomingEvents } = data.data;

        const todayStr = new Date().toDateString();
        const todayList = upcomingEvents.filter((event: IEvent) =>
          new Date(event.startDate).toDateString() === todayStr
        );

        // Auto-redirect if only one today's event and user already applied
        if (
          todayList.length === 1 &&
          user?.eventApplied?.some((e: any) => e.eventCode === todayList[0].eventCode)
        ) {
          router.push(`/questions/${todayList[0]._id}`);
          return;
        }

        setTodaysEvents(todayList);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  // Called by UserEventCard after successful apply
  const handleApply = (event: IEvent) => {
    const todayStr = new Date().toDateString();
    const isToday = new Date(event.startDate).toDateString() === todayStr;

    if (isToday) {
      // Event is in todayList → go to specific event questions
      router.push(`/questions/${event._id}`);
    } else {
      // Not today's event → go to questions selection page
      router.push('/questions');
    }
  };

  return (
    <ComponentWrapper>
      <div className="min-h-screen bg-background w-full mx-auto px-4 lg:px-8">
        <div className="py-8 space-y-6">

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Live Questions Sessions</h1>
              <p className="text-slate-500">Select an event happening today to join the Questions session.</p>
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full p-12 text-center text-muted-foreground">
                Loading today's events...
              </div>
            ) : todaysEvents.length === 0 ? (
              <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No Events Today</h3>
                <p className="text-slate-500 mt-1">
                  There are no live Questions sessions scheduled for today.
                </p>
              </div>
            ) : (
              todaysEvents.map((event) => (
                <UserEventCard
                  key={event._id}
                  event={event}
                  onApply={handleApply} // ← passes redirect logic
                />
              ))
            )}
          </div>
        </div>
      </div>
    </ComponentWrapper>
  );
}