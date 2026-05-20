"use client";

import { useEffect, useState } from "react";
import Marquee from "react-fast-marquee";
import { CalendarDays, MapPin } from "lucide-react";

import apiClient from "@/lib/api-client";
import { IEvent } from "@/types/interface";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Speaker {
  name: string;
  avatar: string;
  role?: string;
}

interface SessionCardData {
  eventTitle: string;
  sessionTitle: string;
  description: string;
  venue: string;
  city: string;
  icon: React.ElementType;
  status: "upcoming" | "completed";
  speakers?: Speaker[];
  date?: string;
}

// ─── Session Card ────────────────────────────────────────────────────────────
function SessionCard({ session }: { session: SessionCardData }) {
  const Icon = session.icon;
  const isCompleted = session.status === "completed";

  return (
    <div className="mx-3 flex w-[360px] h-[440px] shrink-0 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#2091dc]/10 to-[#2db1e6]/10 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="inline-flex shrink-0 rounded-xl bg-gradient-to-br from-[#2091dc] to-[#2db1e6] p-2.5 text-white shadow-sm">
              <Icon className="h-5 w-5" />
            </div>

            <div>
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  isCompleted
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                {isCompleted ? "✓ Completed" : "⏳ Upcoming"}
              </span>

              {session.date && (
                <p className="mt-1 text-[11px] text-slate-400">
                  {session.date}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Event Name */}
        <p className="mt-4 text-[12px] font-semibold uppercase tracking-widest text-[#2091dc]">
          {session.eventTitle}
        </p>

        {/* Session Name */}
        <h4 className="mt-1 text-[20px] font-bold leading-tight text-[#111f3a]">
          {session.sessionTitle}
        </h4>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        {/* Description */}
        <p className="text-[13px] leading-relaxed text-slate-500 line-clamp-3">
          {session.description.substring(0, 50)} ...
        </p>

        {/* Venue */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2091dc]" />

          <div>
            <p className="text-[12px] font-semibold text-slate-700">
              {session.venue}
            </p>

            <p className="text-[11px] text-slate-500">
              {session.city}
            </p>
          </div>
        </div>

        {/* Speakers */}
        {session.speakers && session.speakers.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Speakers
            </p>

            <div className="flex flex-wrap gap-2">
              {session.speakers.map((speaker) => (
                <div
                  key={speaker.name}
                  className="flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 py-1 pl-1 pr-3"
                >
                  <img
                    src={speaker.avatar}
                    alt={speaker.name}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                    loading="lazy"
                  />

                  <div className="leading-tight">
                    <p className="text-[11px] font-semibold text-slate-700">
                      {speaker.name}
                    </p>

                    {speaker.role && (
                      <p className="text-[10px] text-slate-400">
                        {speaker.role}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Section ─────────────────────────────────────────────────────────────
export function SessionsSection() {
  const [upcomingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
  const [completedEvents, setCompletedEvents] = useState<IEvent[]>([]);

  const fetchEvents = async () => {
    try {
      const { data } = await apiClient.get("/api/event");

      if (data.success) {
        setUpcomingEvents(data.data.upcomingEvents || []);
        setCompletedEvents(data.data.pastEvents || []);
      }
    } catch (error) {
      console.error("Error fetching events", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ─── Flatten Event Sessions ────────────────────────────────────────────────
  const upcomingItems: SessionCardData[] = upcomingEvents.flatMap((event) =>
    event.sessions.map((session: any) => ({
      eventTitle: event.title,
      sessionTitle: session.title,
      description: session.description,
      venue: event.location?.venueName || "Venue TBA",
      city: event.location?.city || "",
      icon: CalendarDays,
      status: "upcoming",
      date: new Date(event.startDate).toLocaleDateString(),

      speakers:
        session.speakers?.map((speaker: any) => ({
          name: speaker.name,
          avatar:
            speaker.avatar ||
            "https://ui-avatars.com/api/?name=" +
              encodeURIComponent(speaker.name),
          role: speaker.role,
        })) || [],
    }))
  );

const completedItems: SessionCardData[] = completedEvents.flatMap((event) =>
  (event.sessions || []).map((session: any) => ({
    eventTitle: event.title,
    sessionTitle: session.title || "Untitled Session",
    description: session.description || "No description available",
    venue: event.location?.venueName || "Venue TBA",
    city: event.location?.city || "",
    icon: CalendarDays,
    status: "completed",
    date: new Date(event.startDate).toLocaleDateString(),

    speakers:
      session.speakers?.map((speaker: any) => ({
        name: speaker.name,
        avatar:
          speaker.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            speaker.name
          )}`,
        role: speaker.role,
      })) || [],
  }))
);

  return (
    <section className="mx-auto w-full pb-12 md:pb-16">
      {/* Heading */}
      <div className="px-4 sm:px-6">
        <h3 className="mt-4 text-center text-3xl font-bold text-[#111f3a] sm:text-5xl">
          Workshop Sessions
        </h3>

        <p className="mt-3 text-center text-slate-500">
          Explore upcoming and completed sessions from our events
        </p>
      </div>

      {/* Upcoming */}
      <div className="mt-10">
        <div className="mb-3 flex items-center gap-2 px-4 sm:px-6">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />

          <p className="text-[13px] font-semibold uppercase tracking-widest text-blue-600">
            Upcoming Sessions
          </p>
        </div>

        <Marquee
          direction="right"
          speed={100}
          pauseOnHover
          gradient
          gradientColor="white"
          gradientWidth={60}
          className="overflow-hidden py-2 [&::-webkit-scrollbar]:hidden"
        >
          {upcomingItems.map((session, i) => (
            <SessionCard key={`upcoming-${i}`} session={session} />
          ))}
        </Marquee>
      </div>

      {/* Completed */}
      {
        completedItems.length > 0 && (
          <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 px-4 sm:px-6">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />

          <p className="text-[13px] font-semibold uppercase tracking-widest text-emerald-600">
            Completed Sessions
          </p>
        </div>

        <Marquee
          direction="left"
          speed={100}
          pauseOnHover
          gradient
          gradientColor="white"
          gradientWidth={60}
          className="overflow-hidden py-2 [&::-webkit-scrollbar]:hidden"
        >
          {completedItems.map((session, i) => (
            <SessionCard key={`completed-${i}`} session={session} />
          ))}
        </Marquee>
      </div>
        )
      }
    </section>
  );
}