'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import EventForm from '@/components/admin/EventForm'
import { toast } from 'react-toastify'
import { IEvent } from '@/types/interface'
import apiClient from '@/lib/api-client'

export default function CreateEvent() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleFormSubmit = async (formData: IEvent) => {
    try {
      setLoading(true)
      
      const { data } = await apiClient.post('/api/admin/manage-event', {
        ...formData,
      })
      
      if (data.success) {
        toast.success('Event created successfully')
        router.push('/admin/manage-event')
      } else {
        toast.error(data.message || 'Failed to create event')
      }
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/admin/manage-event')
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
        <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
        <p className="text-gray-600 mt-2">Fill in the details to create a new event</p>
      </div>
      
      <EventForm
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        isLoading={loading}
      />
    </div>
  )
}
