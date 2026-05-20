'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import EventForm from '@/components/admin/EventForm'
import { toast } from 'react-toastify'
import { IEvent } from '@/types/interface'
import apiClient from '@/lib/api-client'

export default function EditEvent() {
  const router = useRouter()
  const params = useParams()
  const eventId = params.id as string
  
  const [event, setEvent] = useState<IEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  const fetchEvent = async () => {
    try {
      setLoading(true)
      const {data} = await apiClient.get(`/api/admin/manage-event/${eventId}`)
      
      if (data.success) {
        setEvent(data.data)
      } else {
        toast.error(data.message || 'Failed to fetch event')
        router.push('/admin/manage-event')
      }
    } catch (error) {
      console.error('Error fetching event:', error)
      toast.error('Failed to fetch event')
      router.push('/admin/manage-event')
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = async (formData: IEvent) => {
    try {
      setFormLoading(true)
      
      const {data} = await apiClient.put(`/api/admin/manage-event/${eventId}`, { ...formData})
      
      if (data.success) {
        toast.success('Event updated successfully')
        router.push('/admin/manage-event')
      } else {
        toast.error(data.message || 'Failed to update event')
      }
    } catch (error) {
      console.error('Error updating event:', error)
      toast.error('Failed to update event')
    } finally {
      setFormLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/manage-event')
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg">Loading event...</div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-lg text-red-600">Event not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="mb-4"
        >
          ← Back to Events
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
        <p className="text-gray-600 mt-2">Update the event details</p>
      </div>
      
      <EventForm
        event={event}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        isLoading={formLoading}
      />
    </div>
  )
}
