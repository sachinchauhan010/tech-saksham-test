'use client';

import { useEffect, useState } from 'react';
import { Calendar, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';

import apiClient from '@/lib/api-client';
import { IEvent } from '@/types/interface';
import { Button } from '@/components/ui/button';
import ComponentWrapper from '@/components/ComponentWrapper';

export default function QuestionsEventSelectionPage() {
  const [todaysEvents, setTodaysEvents] = useState<IEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get('/api/event');

      if (response.data.success) {
        const { upcomingEvents } = response.data.data;

        // Filter only events happening today
        // const todayStr = new Date().toDateString();

        // const todayList = upcomingEvents.filter((event: IEvent) => {
        //   return new Date(event.startDate).toDateString() === todayStr;
        // });

        setTodaysEvents(upcomingEvents);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ComponentWrapper>

    <div className="min-h-screen w-full bg-[#f8fafc]">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-100">
            <MessageSquare className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              Live Questions Sessions
            </h1>

            <p className="mt-2 max-w-2xl text-slate-500">
              Select an event happening today and participate in live interactive
              question sessions with attendees and speakers.
            </p>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <div className="col-span-full rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-sm">
              <p className="text-slate-500">
                Loading today&apos;s events...
              </p>
            </div>
          ) : todaysEvents.length === 0 ? (
            <div className="col-span-full rounded-3xl border-2 border-dashed border-slate-200 bg-white p-16 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Calendar className="h-8 w-8 text-slate-400" />
              </div>

              <h3 className="text-xl font-semibold text-slate-900">
                No Events Today
              </h3>

              <p className="mt-2 text-slate-500">
                There are currently no live Questions sessions scheduled for
                today.
              </p>
            </div>
          ) : (
            todaysEvents.map((event) => {
              const now = Date.now();

              const startTime = Math.min(
                ...event.sessions.map((s: any) =>
                  new Date(s.startTime).getTime()
                )
              );

              const endTime = Math.max(
                ...event.sessions.map((s: any) =>
                  new Date(s.endTime).getTime()
                )
              );

              const isLive = now >= startTime && now <= endTime;

              return (
                <div
                  key={event._id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {/* Banner */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={event.bannerImage}
                      alt={event.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    {/* Live Badge */}
                    {isLive && (
                      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                        LIVE NOW
                      </div>
                    )}

                    {/* Event Title */}
                    <div className="absolute bottom-5 left-5 right-5">
                      <h2 className="line-clamp-2 text-2xl font-bold text-white">
                        {event.title}
                      </h2>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-5 p-5">
                    {/* Description */}
                    <p className="line-clamp-3 text-sm leading-6 text-slate-500">
                      {event.shortDescription || event.description}
                    </p>

                    {/* Venue */}
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Venue
                      </p>

                      <p className="mt-2 text-sm font-semibold text-slate-800">
                        {event.location?.venueName || 'Venue TBA'}
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {event.location?.city}
                      </p>
                    </div>

                    {/* Sessions */}
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                        Sessions
                      </p>

                      <div className="space-y-2">
                        {event.sessions
                          ?.slice(0, 3)
                          .map((session: any, index: number) => (
                            <div
                              key={index}
                              className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 transition-colors hover:bg-slate-100"
                            >
                              <p className="text-sm font-medium text-slate-700">
                                {session.title}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Button */}
                    <Button
                      onClick={() =>
                        router.push(`/live-questions/${event._id}`)
                      }
                    >
                      <MessageSquare className="h-4 w-4" />
                      See Live Questions
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
          
    </ComponentWrapper>
  );
}