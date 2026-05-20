"use client";

import { useState, useEffect } from "react";
import UserEventCard from "@/components/UserEventCard";
import { IEvent } from "@/types/interface";
import apiClient from "@/lib/api-client";
import { EVENT_STATUS } from "@/lib/enum";
import ComponentWrapper from "@/components/ComponentWrapper";

export default function EventsPage() {
  const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<IEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const transformEventData = (event: any): IEvent => ({
    ...event,
    startDate: new Date(event.startDate),
    endDate: new Date(event.endDate),
    registrationOpenDate: new Date(event.registrationOpenDate),
    registrationCloseDate: new Date(event.registrationCloseDate),
    sessions: (event.sessions || []).map((session: any) => ({
      ...session,
      startTime: new Date(session.startTime),
      endTime: new Date(session.endTime),
    })),
  });

  const fetchEvents = async () => {
    try {
      const response = await apiClient.get("/api/event");

      if (response.data.success) {
        const { upcomingEvents, pastEvents } = response.data.data;
        setUpcomingEvents((upcomingEvents || []).map(transformEventData));
        setCompletedEvents((pastEvents || []).map(transformEventData));
      } else {
        console.error("Failed to fetch events:", response.data.message);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const visibleUpcoming = upcomingEvents.filter(
    (e) => e.status !== EVENT_STATUS.DRAFT
  );
  const visibleCompleted = completedEvents.filter(
    (e) => e.status !== EVENT_STATUS.DRAFT
  );

  if (loading) {
    return (
      <ComponentWrapper>
        <div className="w-full mx-auto sm:px-4 lg:px-8 text-center text-slate-400">
          Loading events…
        </div>
      </ComponentWrapper>
    );
  }

  return (
    <ComponentWrapper>
    <div className="space-y-10 w-full mx-auto sm:px-4 lg:px-8">
      <h1 className="text-2xl font-bold">All Events</h1>

      {/* Upcoming Events */}
      {visibleUpcoming.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-blue-600">
            Upcoming Events
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {visibleUpcoming.map((event) => (
              <UserEventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Events */}
      {visibleCompleted.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-emerald-600">
            Completed Events
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {visibleCompleted.map((event) => (
              <UserEventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {visibleUpcoming.length === 0 && visibleCompleted.length === 0 && (
        <p className="text-center text-slate-500 py-12">
          No events found.
        </p>
      )}
    </div>
    </ComponentWrapper>
  );
}