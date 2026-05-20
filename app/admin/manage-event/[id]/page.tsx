'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import { IEvent } from '@/types/interface'
import { Calendar, MapPin, Clock, Users, Tag, Share2, Ticket, ArrowRight, Edit, Trash2 } from 'lucide-react'
import apiClient from '@/lib/api-client'
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
} from "@/components/ui/alert-dialog"
import UserAvatarGroup from '@/components/ui/UserAvatarGroup'

export default function AdminEventDetails() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<IEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const eventId = params.id as string

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true)
        const response = await apiClient.get(`/api/admin/manage-event/${eventId}`)
        
        if (response.data.success) {
          setEvent(response.data.data)
        } else {
          toast.error(response.data.message || 'Failed to fetch event')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        toast.error('Failed to fetch event')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const handleDeleteEvent = async () => {
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    setIsDeleteDialogOpen(false)
    
    try {
      const response = await apiClient.delete(`/api/admin/manage-event/${eventId}`)
      
      if (response.data.success) {
        toast.success('Event deleted successfully')
        router.push('/admin/manage-event')
      } else {
        toast.error(response.data.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h1>
          <p className="text-gray-600">The event you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/manage-event')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const heroImage =
    // event.bannerImage?.includes("http")      ?
 event.bannerImage
      // : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"

  return (
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
            <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/30">
              {event.format}
            </span>
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

          {/* Organizer Details */}
          {event.organizer && event.organizer.length > 0 && (
            <div className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40">
              <h3 className="font-extrabold text-2xl text-slate-900 mb-6 flex items-center gap-3">
                <Users className="text-orange-600 w-7 h-7" />
                Event Organizer{event.organizer.length > 1 ? 's' : ''}
              </h3>
              <div className="space-y-4">
                {event.organizer.map((organizer, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {typeof organizer === 'object' && 'name' in organizer 
                          ? organizer.name.substring(0, 2).toUpperCase()
                          : organizer.toString().substring(0, 2).toUpperCase()
                        }
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-slate-900 mb-1">
                        {typeof organizer === 'object' && 'name' in organizer 
                          ? organizer.name 
                          : organizer.toString()
                        }
                      </h4>
                      {typeof organizer === 'object' && 'email' in organizer && (
                        <p className="text-sm text-slate-600 mb-1">{organizer.email}</p>
                      )}
                      {typeof organizer === 'object' && 'department' in organizer && (
                        <p className="text-sm text-slate-500 mb-1">{organizer.department}</p>
                      )}
                      {/* {typeof organizer === 'object' && 'role' in organizer && organizer.role && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {organizer.role}
                        </span>
                      )} */}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sessions */}
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
                      
                      {/* Session Speakers */}
                      {session.speakers && session.speakers.length > 0 && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Speakers:</h5>
                          <div className="space-y-2">
                            {session.speakers.map((speaker, speakerIndex) => (
                              <div key={speakerIndex} className="flex items-center gap-3">
                                {speaker.photo && (
                                  <img 
                                    src={speaker.photo} 
                                    alt={speaker.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{speaker.name}</p>
                                  {speaker.bio && <p className="text-sm text-gray-600">{speaker.bio}</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Gallery */}
          {event.gallery && event.gallery.length > 0 && (
            <section>
              <h2 className="text-3xl font-bold mb-6 text-slate-900 flex items-center gap-3">
                <span className="w-10 h-1.5 bg-blue-600 rounded-full inline-block" />
                Event Gallery
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {event.gallery.map((image, index) => (
                  <img 
                    key={index}
                    src={image} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
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

            <div className="mt-10 border-t border-slate-100">
              <div className="space-y-3">
                <Button
                  onClick={() => router.push(`/admin/manage-event/edit/${event._id}`)}
                  className="w-full font-semibold text-lg py-3 rounded-2xl transition-all shadow-lg bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/30 hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                >
                  <Edit className="w-5 h-5" /> Edit Event
                </Button>
                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full font-semibold text-lg py-3 rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-5 h-5" /> Delete Event
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the event "{event?.title}" and all associated data.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel asChild>
                        <Button variant="outline">Cancel</Button>
                      </AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button 
                          onClick={confirmDelete}
                          variant="destructive"
                          className="font-semibold bg-red-500 hover:bg-red-600"
                        >
                          Yes, Delete Event
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <Button
                  variant="outline"
                  onClick={() => router.push('/admin/manage-event')}
                  className="w-full font-semibold text-lg py-3 rounded-2xl transition-all"
                >
                  Back to Events
                </Button>
              </div>
            </div>

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

          <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-sm">
            <Share2 className="w-5 h-5" /> Share With Friends
          </button>
        </div>
      </div>
    </div>
  )
}
