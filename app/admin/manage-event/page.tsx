'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EventList from '@/components/admin/EventList'
import { toast } from 'react-toastify'
import { IEvent } from '@/types/interface'
import apiClient from '@/lib/api-client'

export default function ManageEvents() {
  const [events, setEvents] = useState<IEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [viewingEvent, setViewingEvent] = useState<IEvent | null>(null)

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const {data} = await apiClient.get('/api/admin/manage-event')
      
      if (data.success) {
        setEvents(data.data || [])
      } else {
        toast.error(data.message || 'Failed to fetch events')
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      toast.error('Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  const handleViewEvent = (event: IEvent) => {
    setViewingEvent(event)
  }

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const {data} = await apiClient.delete(`/api/admin/manage-event/${eventId}`)
      
      if (data.success) {
        toast.success('Event deleted successfully')
        fetchEvents() // Refresh list
      } else {
        toast.error(data.message || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    }
  }


  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  if (viewingEvent) {
    return (
      <div className="container mx-auto p-6">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold">{viewingEvent.title}</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.href = `/admin/edit-event/${viewingEvent._id}`}
                >
                  Edit Event
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setViewingEvent(null)}
                >
                  Back to List
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Event Code:</span> {viewingEvent.eventCode}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {viewingEvent.category}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {viewingEvent.format}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {viewingEvent.status}
                </div>
                <div>
                  <span className="font-medium">Featured:</span> {viewingEvent.isFeatured ? 'Yes' : 'No'}
                </div>
                <div>
                  <span className="font-medium">Slug:</span> {viewingEvent.slug}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700">{viewingEvent.description}</p>
              {viewingEvent.shortDescription && (
                <div className="mt-3">
                  <span className="font-medium">Short Description:</span>
                  <p className="text-gray-600">{viewingEvent.shortDescription}</p>
                </div>
              )}
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Event Schedule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Start Date:</span> {formatDate(viewingEvent.startDate)}
                </div>
                <div>
                  <span className="font-medium">End Date:</span> {formatDate(viewingEvent.endDate)}
                </div>
                <div>
                  <span className="font-medium">Registration Opens:</span> {formatDate(viewingEvent.registrationOpenDate)}
                </div>
                <div>
                  <span className="font-medium">Registration Closes:</span> {formatDate(viewingEvent.registrationCloseDate)}
                </div>
              </div>
            </div>

            {/* Location */}
            {viewingEvent.location && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Venue:</span> {viewingEvent.location.venueName}
                  </div>
                  <div>
                    <span className="font-medium">City:</span> {viewingEvent.location.city}
                  </div>
                  <div className="md:col-span-2">
                    <span className="font-medium">Address:</span> {viewingEvent.location.address}
                  </div>
                  {viewingEvent.location.mapLink && (
                    <div className="md:col-span-2">
                      <span className="font-medium">Map Link:</span>
                      <a href={viewingEvent.location.mapLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-2">
                        View Map
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Virtual Link */}
            {viewingEvent.virtualLink && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Virtual Access</h3>
                <a href={viewingEvent.virtualLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Join Virtual Event
                </a>
              </div>
            )}

            {/* Banner Image */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Banner Image</h3>
              <img 
                src={viewingEvent.bannerImage} 
                alt={viewingEvent.title}
                className="max-w-full h-auto rounded-lg border"
              />
            </div>

            {/* Gallery */}
            {viewingEvent.gallery && viewingEvent.gallery.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Gallery</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {viewingEvent.gallery.map((image, index) => (
                    <img 
                      key={index}
                      src={image} 
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sessions */}
            {viewingEvent.sessions && viewingEvent.sessions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Sessions</h3>
                <div className="space-y-4">
                  {viewingEvent.sessions.map((session, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <h4 className="font-medium mb-2">{session.title}</h4>
                      <p className="text-gray-600 text-sm mb-3">{session.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Start:</span> {formatDate(session.startTime)}
                        </div>
                        <div>
                          <span className="font-medium">End:</span> {formatDate(session.endTime)}
                        </div>
                        {session.location && (
                          <>
                            {session.location.room && (
                              <div>
                                <span className="font-medium">Room:</span> {session.location.room}
                              </div>
                            )}
                            {session.location.venue && (
                              <div>
                                <span className="font-medium">Venue:</span> {session.location.venue}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {viewingEvent.tags && viewingEvent.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {viewingEvent.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Manage Events</h1>
        <p className="text-gray-600 mt-2">Create, edit, and manage your events</p>
      </div>
      
      <EventList
        events={events}
        onDelete={handleDeleteEvent}
        onView={handleViewEvent}
        isLoading={loading}
      />
    </div>
  )
}