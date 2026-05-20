"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { IEvent } from "@/types/interface";
import { Calendar, MapPin, Clock, Users, Tag, Share2, Ticket, ArrowRight } from "lucide-react";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import ComponentWrapper from "@/components/ComponentWrapper";

export default function EventDetailsPage() {
  const params = useParams();
  const [event, setEvent] = useState<IEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [isApplied, setIsApplied] = useState(false);

  const eventId = params.id as string;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const data = await apiClient.get(`/api/event/${eventId}`);

        if (data.data.success && data.data.data) {
          setEvent(data.data.data);
        } else {
          setEvent(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
      } finally {
        setLoading(false);
      }

      try {
        const applyData = await apiClient.get(`/api/event/${eventId}/apply`);
        if (applyData.data?.data && Array.isArray(applyData.data.data)) {
          const applied = applyData.data.data.some((e: any) => e.eventId === eventId || e.eventCode === eventId);
          setIsApplied(applied);
        }
      } catch (error) {
        // User might not be logged in or error checking apply status
        console.log("Not logged in or error checking apply status");
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const handleApply = async() => {
    try {
      const {data} = await apiClient.post(`/api/event/${eventId}/apply`);
      if (data.success) {
        toast.success(data.message)
        setIsApplied(true);
      } else {
        toast.error(data.message)
      }
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Failed to apply for event")
    }
  };

  const handleRemoveApplication = async() => {
    try {
      const {data} = await apiClient.delete(`/api/event/${eventId}/apply`);
      if (data.success) {
        toast.success(data.message)
        setIsApplied(false);
      } else {
        toast.error(data.message)
      }
    } catch (error:any) {
      toast.error(error?.response?.data?.message || "Failed to remove application")
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const heroImage =
    // event.bannerImage?.includes("http")?
     event.bannerImage
      // : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";

  return (
    <ComponentWrapper>
    <div className="bg-white text-slate-900 rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 w-full lg:max-w-7xl 2xl:max-w-8xl mx-auto">
      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] w-full group">
        <img
          src={heroImage}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 lg:p-16">
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-blue-500/30">
              {event.category}
            </span>
            <span className="bg-white/20 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/30">
              {event.format}
            </span>
            {/* {event.idcard && (
              <span className="bg-purple-600/80 backdrop-blur-md text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-purple-400/30">
                ID Card: {event.idcard.charAt(0).toUpperCase() + event.idcard.slice(1)}
              </span>
            )} */}
            {event.status && (
              <span
                className={`text-xs font-bold px-4 py-1.5 rounded-full border ${
                  event.status.toLowerCase() === "upcoming"
                    ? "bg-green-500/20 text-green-300 border-green-500/30"
                    : "bg-white/20 text-white border-white/30"
                }`}
              >
                {event.status}
              </span>
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight max-w-4xl">
            {event.title}
          </h1>
          <p className="text-lg md:text-xl text-slate-200 max-w-2xl line-clamp-2 font-medium">
            {event.shortDescription}
          </p>
        </div>
      </div>

      <div className="p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h2 className="text-3xl font-bold mb-6 text-slate-900 flex items-center gap-3">
              <span className="w-10 h-1.5 bg-blue-600 rounded-full inline-block" />
              About The Event
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
              {event.description}
            </p>
          </section>
          
          {event.sessions && event.sessions.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-10 text-slate-900 flex items-center gap-3">
                <Clock className="text-blue-600 w-8 h-8" /> Event Schedule
              </h2>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {event.sessions.map((session, idx) => (
                  <div
                    key={session._id || session.title}
                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                  >
                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-white bg-blue-100 text-blue-600 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                      <span className="font-bold text-base">{idx + 1}</span>
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-xl transition-all">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          {" - "}
                          {new Date(session.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {session.tags?.map((tag) => (
                          <span key={tag} className="text-xs font-semibold text-slate-600 bg-slate-200 px-2 py-1 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h4 className="font-bold text-xl text-slate-900 mb-2">{session.title}</h4>
                      <p className="text-slate-600 mb-4 leading-relaxed">{session.description}</p>
                      {session.location?.room && (
                        <div className="flex items-center text-sm font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 w-fit">
                          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                          {session.location.room}, {session.location.venue}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500" />
            <h3 className="font-extrabold text-2xl text-slate-900 mb-8">Event Overview</h3>
            <div className="space-y-8">
              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0 text-blue-600 border border-blue-100">
                  <Calendar className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1">Date & Time</p>
                  <p className="font-bold text-slate-900 text-lg">
                    {new Date(event.startDate).toLocaleDateString(undefined, {
                      weekday: "short", year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-slate-600 font-medium">
                    {new Date(event.startDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" - "}
                    {new Date(event.endDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>

              {event.location && (
                <div className="flex gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0 text-purple-600 border border-purple-100">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 font-semibold mb-1">Location</p>
                    <p className="font-bold text-slate-900 text-lg">{event.location.venueName}</p>
                    <p className="text-sm text-slate-600 font-medium">
                      {event.location.address}, {event.location.city}
                    </p>
                    {event.location.mapLink && (
                      <a
                        href={event.location.mapLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-bold mt-2 inline-flex items-center gap-1"
                      >
                        Get Directions <ArrowRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-5">
                <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shrink-0 text-green-600 border border-green-100">
                  <Ticket className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-semibold mb-1">Registration</p>
                  <p className="font-bold text-slate-900 text-lg">
                    Closes{" "}
                    {new Date(event.registrationCloseDate).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* <div className="mt-10 border-t border-slate-100">
              {isApplied ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-full font-semibold text-lg py-3 rounded-2xl transition-all shadow-lg bg-red-600 hover:bg-red-700 text-white shadow-red-500/30 hover:-translate-y-1 active:translate-y-0"
                    >
                      Remove Application
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove Event Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to remove your application for "{event.title}"? This action cannot be undone and you will need to apply again if you change your mind.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleRemoveApplication} className="bg-red-600 hover:bg-red-700">
                        Remove Application
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="w-full font-semibold text-lg py-3 rounded-2xl transition-all shadow-lg bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0"
                    >
                      Apply For This Event
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Event Application</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to apply for "{event.title}"? This action will register you for the event and you will receive further details via email.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleApply} className="bg-blue-600 hover:bg-blue-700">
                        Apply Now
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div> */}

            {event.tags && event.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 font-semibold mb-4">Event Tags</p>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, i) => (
                    <span key={i} className="flex items-center gap-1 text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Tag className="w-3 h-3" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm">
            <Share2 className="w-5 h-5" /> Share With Friends
          </button> */}
        </div>
      </div>
    </div>
    </ComponentWrapper>
  );
}