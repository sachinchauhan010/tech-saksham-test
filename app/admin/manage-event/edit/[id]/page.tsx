'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-toastify'
import { IEvent } from '@/types/interface'
import EventForm from '@/components/admin/EventForm'
import apiClient from '@/lib/api-client'

export default function EditEventPage() {
  const params = useParams()
  const router = useRouter()
  const [event, setEvent] = useState<IEvent | null>(null)
  const [loading, setLoading] = useState(true)

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

  const handleFormSubmit = async (data: any) => {
    try {
      const response = await apiClient.put(`/api/admin/manage-event/${eventId}`, data)
      
      if (response.data.success) {
        toast.success('Event updated successfully')
        router.push('/admin/manage-event')
      } else {
        toast.error(response.data.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    }
  }

  const handleCancel = () => {
    router.push('/admin/manage-event')
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

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Event</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Back to Events
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EventForm 
            event={event}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
            isLoading={loading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
