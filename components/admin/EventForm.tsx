'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { format } from 'date-fns'
import { Plus, Trash2, Save, X, ChevronRight, Calendar, MapPin, Users, Tag, Image as ImageIcon, Layers, Settings, FileText, Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import apiClient from '@/lib/api-client'
import { EVENT_CATEGORY, EVENT_FORMAT, EVENT_STATUS, ROLE, ID_CARD_TYPE } from '@/lib/enum'
import { IEvent } from '@/types/interface'
import ImageUploadWidget from '@/components/admin/ImageUploadWidget'

interface OrganizerUser {
  _id: string
  name: string
  email: string
  role: string
}

interface EventFormData {
  eventCode: string
  title: string
  slug: string
  description: string
  shortDescription: string
  category: string
  bannerImage: string
  stateLogo: string
  gallery: string[]
  startDate: string
  endDate: string
  registrationOpenDate: string
  registrationCloseDate: string
  format: string
  location: {
    venueName: string
    address: string
    city: string
    mapLink: string
  }
  virtualLink: string
  organizer: string[]
  sessions: any[]
  status: string
  tags: string[]
  isFeatured?: boolean
  isIdCardIssue?: boolean
  isCertificateIssue?: boolean
  certificateTemplate: string
  delegateIdCard?: string
  guestIdCard?: string
  organizerIdCard?: string
}

interface EventFormProps {
  event?: any
  onSubmit: (data: any) => void
  onCancel: () => void
  isLoading?: boolean
}

function generateEventCode(): string {
  const randomNumber = Math.floor(1000 + Math.random() * 9000)
  return `TS${randomNumber}`
}

const sectionStyles = {
  wrapper: 'relative mb-2',
  header: 'flex items-center gap-3 mb-6 pb-3 border-b border-slate-100',
  iconBox: 'h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0',
  title: 'text-base font-semibold text-slate-800 tracking-tight',
  subtitle: 'text-xs text-slate-400 mt-0.5',
}

const inputStyles = 'h-10 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all duration-200'
const textareaStyles = 'rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all duration-200 w-full resize-none'
const selectStyles = 'h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm text-slate-800 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all duration-200 appearance-none cursor-pointer'
const labelStyles = 'block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5'

export default function EventForm({ event, onSubmit, onCancel, isLoading = false }: EventFormProps) {
  const [galleryUrls, setGalleryUrls] = useState<string[]>(event?.gallery || [''])
  const [organizerIds, setOrganizerIds] = useState<string[]>(event?.organizer?.map((id: any) => id.toString()) || [''])
  const [organizerUsers, setOrganizerUsers] = useState<OrganizerUser[]>([])
  const [loadingOrganizers, setLoadingOrganizers] = useState(true)

  useEffect(() => {
    const fetchOrganizerUsers = async () => {
      try {
        const { data } = await apiClient.get('/api/users?role=user')
        if (data.success) {
          setOrganizerUsers(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching organizer users:', error)
      } finally {
        setLoadingOrganizers(false)
      }
    }
    fetchOrganizerUsers()
  }, [])

  const [uploading, setUploading] = useState<string>('')
  const [speakers, setSpeakers] = useState<any[]>(
    event?.speakers?.map((s: any) => ({ name: s.name, bio: s.bio, photo: s.photo })) ||
    [{ name: '', bio: '', photo: '' }]
  )
  const [sessions, setSessions] = useState<any[]>(
    event?.sessions?.map((s: any) => ({
      title: s.title,
      description: s.description,
      startTime: s.startTime instanceof Date ? s.startTime.toISOString().slice(0, 16) : s.startTime?.toString() || '',
      endTime: s.endTime instanceof Date ? s.endTime.toISOString().slice(0, 16) : s.endTime?.toString() || '',
      location: s.location,
      virtualLink: s.virtualLink,
      speakers: s.speakers?.map((sp: any) => ({ name: sp.name, bio: sp.bio, photo: sp.photo })) || [],
      tags: s.tags,
    })) || [{
      title: '', description: '', startTime: '', endTime: '',
      location: { room: '', venue: '' }, virtualLink: '',
      speakers: [{ name: '', bio: '', photo: '' }], tags: [],
    }]
  )
  const [tags, setTags] = useState<string[]>(event?.tags || [''])

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<EventFormData>({
    defaultValues: {
      eventCode: event?.eventCode || generateEventCode(),
      title: event?.title || '',
      slug: event?.slug || '',
      description: event?.description || '',
      shortDescription: event?.shortDescription || '',
      category: event?.category || '',
      bannerImage: event?.bannerImage || '',
      gallery: event?.gallery || [],
      startDate: event?.startDate ? format(new Date(event.startDate), "yyyy-MM-dd'T'HH:mm") : '',
      endDate: event?.endDate ? format(new Date(event.endDate), "yyyy-MM-dd'T'HH:mm") : '',
      registrationOpenDate: event?.registrationOpenDate ? format(new Date(event.registrationOpenDate), 'yyyy-MM-dd') : '',
      registrationCloseDate: event?.registrationCloseDate ? format(new Date(event.registrationCloseDate), 'yyyy-MM-dd') : '',
      format: event?.format || 'in-person',
      location: event?.location || { venueName: '', address: '', city: '', mapLink: '' },
      virtualLink: event?.virtualLink || '',
      organizer: event?.organizer?.map((id: any) => id.toString()) || [''],
      sessions: event?.sessions?.map((s: any) => ({
        title: s.title, description: s.description,
        startTime: s.startTime instanceof Date ? s.startTime.toISOString().slice(0, 16) : s.startTime?.toString() || '',
        endTime: s.endTime instanceof Date ? s.endTime.toISOString().slice(0, 16) : s.endTime?.toString() || '',
        location: s.location, virtualLink: s.virtualLink,
        speakers: s.speakers?.map((sp: any) => ({ name: sp.name, bio: sp.bio, photo: sp.photo })) || [],
        tags: s.tags,
      })) || [{
        title: '', description: '', startTime: '', endTime: '',
        location: { room: '', venue: '' }, virtualLink: '', speakers: [], tags: [],
      }],
      status: event?.status || 'draft',
      tags: event?.tags || [],
      isFeatured: event?.isFeatured || false,
      isIdCardIssue: event?.isIdCardIssue || false,
      isCertificateIssue: event?.isCertificateIssue || false,
      certificateTemplate: event?.certificateTemplate || '',
      delegateIdCard: event?.delegateIdCard || '',
      guestIdCard: event?.guestIdCard || '',
      organizerIdCard: event?.organizerIdCard || '',
    },
  })

  const eventFormat = watch('format')

  const addGalleryUrl = () => setGalleryUrls([...galleryUrls, ''])
  const removeGalleryUrl = (index: number) => setGalleryUrls(galleryUrls.filter((_, i) => i !== index))
  const updateGalleryUrl = (index: number, value: string) => {
    const newUrls = [...galleryUrls]
    newUrls[index] = value
    setGalleryUrls(newUrls)
    setValue('gallery', newUrls.filter(url => url.trim() !== ''))
  }

  const addOrganizer = () => setOrganizerIds([...organizerIds, ''])
  const removeOrganizer = (index: number) => setOrganizerIds(organizerIds.filter((_, i) => i !== index))
  const updateOrganizer = (index: number, value: string) => {
    const newOrganizers = [...organizerIds]
    newOrganizers[index] = value
    setOrganizerIds(newOrganizers)
    setValue('organizer', newOrganizers.filter(id => id.trim() !== ''))
  }

  const addSession = () => setSessions([...sessions, {
    title: '', description: '', startTime: '', endTime: '',
    location: { room: '', venue: '' }, virtualLink: '',
    speakers: [{ name: '', bio: '', photo: '' }], tags: [],
  }])
  const removeSession = (index: number) => setSessions(sessions.filter((_, i) => i !== index))
  const updateSession = (index: number, field: string, value: any) => {
    const newSessions = [...sessions]
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      newSessions[index] = { ...newSessions[index], [parent]: { ...newSessions[index][parent as keyof typeof newSessions[0]], [child]: value } }
    } else {
      newSessions[index] = { ...newSessions[index], [field]: value }
    }
    setSessions(newSessions)
    setValue('sessions', newSessions)
  }

  const updateSessionSpeaker = (sessionIndex: number, speakerIndex: number, field: string, value: string) => {
    const newSessions = [...sessions]
    newSessions[sessionIndex].speakers[speakerIndex] = { ...newSessions[sessionIndex].speakers[speakerIndex], [field]: value }
    setSessions(newSessions)
    setValue('sessions', newSessions)
  }

  const addSessionSpeaker = (sessionIndex: number) => {
    const newSessions = [...sessions]
    newSessions[sessionIndex].speakers.push({ name: '', bio: '', photo: '' })
    setSessions(newSessions)
    setValue('sessions', newSessions)
  }

  const removeSessionSpeaker = (sessionIndex: number, speakerIndex: number) => {
    const newSessions = [...sessions]
    newSessions[sessionIndex].speakers = newSessions[sessionIndex].speakers.filter((_: any, i: number) => i !== speakerIndex)
    setSessions(newSessions)
    setValue('sessions', newSessions)
  }

  const addTag = () => setTags([...tags, ''])
  const removeTag = (index: number) => setTags(tags.filter((_, i) => i !== index))
  const updateTag = (index: number, value: string) => {
    const newTags = [...tags]
    newTags[index] = value
    setTags(newTags)
    setValue('tags', newTags.filter(tag => tag.trim() !== ''))
  }

  const onFormSubmit = (data: EventFormData) => {
    const finalData: IEvent = {
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      registrationOpenDate: new Date(data.registrationOpenDate),
      registrationCloseDate: new Date(data.registrationCloseDate),
      gallery: galleryUrls.filter(url => url.trim() !== ''),
      organizer: organizerIds.filter(id => id.trim() !== '') as any,
      sessions: sessions.filter(session => session.title.trim() !== ''),
      tags: tags.filter(tag => tag.trim() !== ''),
      status: event?.status || 'draft',
      shortDescription: data.shortDescription || '',
      virtualLink: data.virtualLink || '',
      location: {
        venueName: data.location?.venueName || '',
        address: data.location?.address || '',
        city: data.location?.city || '',
        mapLink: data.location?.mapLink || '',
      },
      isIdCardIssue: data.isIdCardIssue,
      isCertificateIssue: data.isCertificateIssue,
      certificateTemplate: data.certificateTemplate || '',
      delegateIdCard: data.delegateIdCard || '',
      guestIdCard: data.guestIdCard || '',
      organizerIdCard: data.organizerIdCard || '',
    }
    onSubmit(finalData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Top Header Bar */}
      <div className="sticky top-0 z-40 backdrop-blur-md bg-white/80 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-200">
              <Layers className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-none">
                {event ? 'Edit Event' : 'Create Event'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Fill in the details below</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="h-9 px-4 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2"
            >
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button
              form="event-form"
              type="submit"
              disabled={isLoading}
              className="h-9 px-5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              <Save className="h-3.5 w-3.5" />
              {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </div>
      </div>

      <form id="event-form" onSubmit={handleSubmit(onFormSubmit)} className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* ── BASIC INFO ── */}
        <Section icon={<FileText className="h-4 w-4 text-indigo-500" />} iconBg="bg-indigo-50" title="Basic Information" subtitle="Core event details and identity">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Event Code" error={errors.eventCode?.message}>
              <Input className={inputStyles} {...register('eventCode', { required: 'Event code is required' })} placeholder="TS1234" />
            </Field>
            <Field label="Event Title" error={errors.title?.message}>
              <Input className={inputStyles} {...register('title', { required: 'Title is required' })} placeholder="Annual Tech Summit 2025" />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="URL Slug" error={errors.slug?.message}>
              <Input className={inputStyles} {...register('slug', { required: 'Slug is required' })} placeholder="annual-tech-summit-2025" />
            </Field>
            <Field label="Category" error={errors.category?.message}>
              <select className={selectStyles} {...register('category', { required: 'Category is required' })}>
                <option value="">Select Category</option>
                {Object.values(EVENT_CATEGORY).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Full Description" error={errors.description?.message}>
              <textarea className={textareaStyles} rows={4} {...register('description', { required: 'Description is required' })} placeholder="Describe your event in detail..." />
            </Field>
          </div>
          <div className="mt-4">
            <Field label="Short Description" error={errors.shortDescription?.message}>
              <textarea className={textareaStyles} rows={2} {...register('shortDescription')} placeholder="A brief tagline or summary (max 250 chars)" maxLength={250} />
            </Field>
          </div>

          {/* Toggles row */}
          <div className="mt-5 flex flex-wrap gap-3">
            <Toggle label="Featured Event" registerProps={register('isFeatured')} color="amber" />
            <Toggle label="ID Card Issuance" registerProps={register('isIdCardIssue')} color="emerald" />
          </div>
        </Section>

        {/* ── IMAGES ── */}
        <Section icon={<ImageIcon className="h-4 w-4 text-violet-500" />} iconBg="bg-violet-50" title="Media & Images" subtitle="Banner, certificate template and gallery">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelStyles}>Banner Image <Required /></label>
              <input type="hidden" {...register('bannerImage', { required: 'Banner image is required' })} />
              <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30 transition-all duration-200 overflow-hidden p-3">
                <ImageUploadWidget
                  value={watch('bannerImage')}
                  onChange={(url) => setValue('bannerImage', url, { shouldValidate: true })}
                  onRemove={() => setValue('bannerImage', '', { shouldValidate: true })}
                />
              </div>
              {errors.bannerImage && <ErrorMsg>{errors.bannerImage.message}</ErrorMsg>}
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>State Logo <Required /></label>
              <input type="hidden" {...register('stateLogo', { required: 'State Logo is required' })} />
              <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30 transition-all duration-200 overflow-hidden p-3">
                <ImageUploadWidget
                  value={watch('stateLogo')}
                  onChange={(url) => setValue('stateLogo', url, { shouldValidate: true })}
                  onRemove={() => setValue('stateLogo', '', { shouldValidate: true })}
                />
              </div>
              {errors.stateLogo && <ErrorMsg>{errors.stateLogo.message}</ErrorMsg>}
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>Certificate Template <Required /></label>
              <input type="hidden" {...register('certificateTemplate', { required: 'Certificate template is required' })} />
              <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-violet-300 bg-slate-50 hover:bg-violet-50/30 transition-all duration-200 overflow-hidden p-3">
                <ImageUploadWidget
                  value={watch('certificateTemplate')}
                  onChange={(url) => setValue('certificateTemplate', url, { shouldValidate: true })}
                  onRemove={() => setValue('certificateTemplate', '', { shouldValidate: true })}
                />
              </div>
              {errors.certificateTemplate && <ErrorMsg>{errors.certificateTemplate.message}</ErrorMsg>}
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>Delegate ID Card Template</label>
              <input type="hidden" {...register('delegateIdCard')} />
              <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30 transition-all duration-200 overflow-hidden p-3">
                <ImageUploadWidget
                  value={watch('delegateIdCard')}
                  onChange={(url) => setValue('delegateIdCard', url, { shouldValidate: true })}
                  onRemove={() => setValue('delegateIdCard', '', { shouldValidate: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>Guest ID Card Template</label>
              <input type="hidden" {...register('guestIdCard')} />
              <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30 transition-all duration-200 overflow-hidden p-3">
                <ImageUploadWidget
                  value={watch('guestIdCard')}
                  onChange={(url) => setValue('guestIdCard', url, { shouldValidate: true })}
                  onRemove={() => setValue('guestIdCard', '', { shouldValidate: true })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={labelStyles}>Organizer ID Card Template</label>
              <input type="hidden" {...register('organizerIdCard')} />
              <div className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 bg-slate-50 hover:bg-indigo-50/30 transition-all duration-200 overflow-hidden p-3">
                <ImageUploadWidget
                  value={watch('organizerIdCard')}
                  onChange={(url) => setValue('organizerIdCard', url, { shouldValidate: true })}
                  onRemove={() => setValue('organizerIdCard', '', { shouldValidate: true })}
                />
              </div>
            </div>
          </div>

          {/* Gallery */}
          <div className="mt-6">
            <label className={labelStyles}>Gallery Images</label>
            <div className="space-y-3">
              {galleryUrls.map((url, index) => (
                <div key={index} className="group relative rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:border-slate-300 hover:bg-white transition-all duration-200">
                  {galleryUrls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeGalleryUrl(index)}
                      className="absolute top-3 right-3 h-7 w-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-red-400 hover:bg-red-100 hover:text-red-600 transition-all duration-150 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <ImageUploadWidget value={url} onChange={(newUrl) => updateGalleryUrl(index, newUrl)} onRemove={() => updateGalleryUrl(index, '')} />
                  <Input className={`${inputStyles} mt-2`} value={url} onChange={(e) => updateGalleryUrl(index, e.target.value)} placeholder="Or paste image URL" />
                </div>
              ))}
            </div>
            <AddButton onClick={addGalleryUrl} className="mt-3">Add Gallery Image</AddButton>
          </div>
        </Section>

        {/* ── DATES ── */}
        <Section icon={<Calendar className="h-4 w-4 text-rose-500" />} iconBg="bg-rose-50" title="Dates & Schedule" subtitle="Event timeline and registration window">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Start Date & Time" error={errors.startDate?.message}>
              <Input type="datetime-local" className={inputStyles} {...register('startDate', { required: 'Start date is required' })} />
            </Field>
            <Field label="End Date & Time" error={errors.endDate?.message}>
              <Input type="datetime-local" className={inputStyles} {...register('endDate', { required: 'End date is required' })} />
            </Field>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Field label="Registration Opens" error={errors.registrationOpenDate?.message}>
              <Input type="date" className={inputStyles} {...register('registrationOpenDate', { required: 'Registration open date is required' })} />
            </Field>
            <Field label="Registration Closes" error={errors.registrationCloseDate?.message}>
              <Input type="date" className={inputStyles} {...register('registrationCloseDate', { required: 'Registration close date is required' })} />
            </Field>
          </div>
        </Section>

        {/* ── FORMAT & LOCATION ── */}
        <Section icon={<MapPin className="h-4 w-4 text-emerald-500" />} iconBg="bg-emerald-50" title="Format & Location" subtitle="How and where the event will be held">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Event Format" error={errors.format?.message}>
              <select className={selectStyles} {...register('format', { required: 'Format is required' })}>
                <option value="">Select Format</option>
                {Object.values(EVENT_FORMAT).map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
            <Field label="Event Status" error={errors.status?.message}>
              <select className={selectStyles} {...register('status', { required: 'Status is required' })}>
                <option value="">Select Status</option>
                {Object.values(EVENT_STATUS).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>

          {(eventFormat === 'in-person' || eventFormat === 'hybrid') && (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-4">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Venue Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Venue Name" error={errors.location && 'venueName' in errors.location ? errors.location.venueName?.message as string : undefined}>
                  <Input className={inputStyles} {...register('location.venueName', { required: 'Venue name is required' })} placeholder="Conference Hall A" />
                </Field>
                <Field label="City" error={errors.location && 'city' in errors.location ? errors.location.city?.message as string : undefined}>
                  <Input className={inputStyles} {...register('location.city', { required: 'City is required' })} placeholder="New Delhi" />
                </Field>
              </div>
              <Field label="Full Address" error={errors.location && 'address' in errors.location ? errors.location.address?.message as string : undefined}>
                <Input className={inputStyles} {...register('location.address', { required: 'Address is required' })} placeholder="123 Main Street, Suite 100" />
              </Field>
              <Field label="Google Maps Link">
                <Input className={inputStyles} {...register('location.mapLink')} placeholder="https://maps.google.com/..." />
              </Field>
            </div>
          )}

          {(eventFormat === 'virtual' || eventFormat === 'hybrid') && (
            <div className="mt-4 p-4 rounded-2xl bg-blue-50/60 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider mb-3">Virtual Access</p>
              <Field label="Virtual Meeting Link" error={errors.virtualLink?.message as string}>
                <Input className={inputStyles} {...register('virtualLink')} placeholder="https://zoom.us/j/..." />
              </Field>
            </div>
          )}
        </Section>

        {/* ── ORGANIZERS ── */}
        <Section icon={<Users className="h-4 w-4 text-blue-500" />} iconBg="bg-blue-50" title="Organizers" subtitle="People responsible for managing this event">
          <div className="space-y-2">
            {organizerIds.map((id, index) => (
              <div key={index} className="flex gap-2">
                <Select value={id} onValueChange={(value) => updateOrganizer(index, value)} disabled={loadingOrganizers}>
                  <SelectTrigger className={`${inputStyles} flex-1 h-10`}>
                    <SelectValue placeholder={loadingOrganizers ? 'Loading...' : 'Select an organizer'} />
                  </SelectTrigger>
                  <SelectContent>
                    {organizerUsers.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-slate-400">{user.email}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {organizerIds.length > 1 && (
                  <button type="button" onClick={() => removeOrganizer(index)} className="h-10 w-10 rounded-xl border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all duration-150 flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <AddButton onClick={addOrganizer} className="mt-3">Add Organizer</AddButton>
        </Section>

        {/* ── SESSIONS ── */}
        <Section icon={<Mic className="h-4 w-4 text-orange-500" />} iconBg="bg-orange-50" title="Sessions" subtitle="Agenda, talks and breakout sessions">
          <div className="space-y-4">
            {sessions.map((session, sessionIndex) => (
              <div key={sessionIndex} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                {/* Session header */}
                <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-orange-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-600">{sessionIndex + 1}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{session.title || `Session ${sessionIndex + 1}`}</span>
                  </div>
                  {sessions.length > 1 && (
                    <button type="button" onClick={() => removeSession(sessionIndex)} className="h-7 w-7 rounded-lg border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all duration-150">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Session Title">
                      <Input className={inputStyles} value={session.title} onChange={(e) => updateSession(sessionIndex, 'title', e.target.value)} placeholder="Opening Keynote" />
                    </Field>
                    <Field label="Virtual Link">
                      <Input className={inputStyles} value={session.virtualLink} onChange={(e) => updateSession(sessionIndex, 'virtualLink', e.target.value)} placeholder="https://zoom.us/..." />
                    </Field>
                  </div>
                  <Field label="Description">
                    <textarea className={textareaStyles} rows={2} value={session.description} onChange={(e) => updateSession(sessionIndex, 'description', e.target.value)} placeholder="Session description..." />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Start Time">
                      <Input type="datetime-local" className={inputStyles} value={session.startTime} onChange={(e) => updateSession(sessionIndex, 'startTime', e.target.value)} />
                    </Field>
                    <Field label="End Time">
                      <Input type="datetime-local" className={inputStyles} value={session.endTime} onChange={(e) => updateSession(sessionIndex, 'endTime', e.target.value)} />
                    </Field>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Room">
                      <Input className={inputStyles} value={session.location?.room || ''} onChange={(e) => updateSession(sessionIndex, 'location.room', e.target.value)} placeholder="Room 101" />
                    </Field>
                    <Field label="Venue">
                      <Input className={inputStyles} value={session.location?.venue || ''} onChange={(e) => updateSession(sessionIndex, 'location.venue', e.target.value)} placeholder="Main Hall" />
                    </Field>
                  </div>

                  {/* Session speakers */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Speakers</p>
                    <div className="space-y-3">
                      {session.speakers.map((speaker: any, speakerIndex: number) => (
                        <div key={speakerIndex} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500">Speaker {speakerIndex + 1}</span>
                            {session.speakers.length > 1 && (
                              <button type="button" onClick={() => removeSessionSpeaker(sessionIndex, speakerIndex)} className="h-6 w-6 rounded-lg border border-red-100 bg-red-50 text-red-400 hover:bg-red-100 flex items-center justify-center transition-all duration-150">
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-3">
                            <Input className={inputStyles} value={speaker.name} onChange={(e) => updateSessionSpeaker(sessionIndex, speakerIndex, 'name', e.target.value)} placeholder="Speaker Name" />
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-2 hover:border-slate-300 transition-colors duration-150">
                              <ImageUploadWidget value={speaker.photo || ''} onChange={(url) => updateSessionSpeaker(sessionIndex, speakerIndex, 'photo', url)} onRemove={() => updateSessionSpeaker(sessionIndex, speakerIndex, 'photo', '')} />
                            </div>
                            <textarea className={textareaStyles} rows={1} value={speaker.bio} onChange={(e) => updateSessionSpeaker(sessionIndex, speakerIndex, 'bio', e.target.value)} placeholder="Short bio..." />
                          </div>
                        </div>
                      ))}
                    </div>
                    <AddButton onClick={() => addSessionSpeaker(sessionIndex)} className="mt-2" small>Add Speaker</AddButton>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <AddButton onClick={addSession} className="mt-3">Add Session</AddButton>
        </Section>

        {/* ── TAGS ── */}
        <Section icon={<Tag className="h-4 w-4 text-pink-500" />} iconBg="bg-pink-50" title="Tags" subtitle="Keywords to help people discover this event">
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <div key={index} className="flex items-center gap-1 h-9 pl-3 pr-1 rounded-full border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-all duration-150">
                <input
                  className="text-sm text-slate-700 bg-transparent outline-none w-24 placeholder:text-slate-400"
                  value={tag}
                  onChange={(e) => updateTag(index, e.target.value)}
                  placeholder="technology"
                />
                {tags.length > 1 && (
                  <button type="button" onClick={() => removeTag(index)} className="h-6 w-6 rounded-full bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all duration-150">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addTag} className="h-9 px-4 rounded-full border border-dashed border-slate-300 text-sm text-slate-500 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50 transition-all duration-200 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add Tag
            </button>
          </div>
        </Section>

        {/* ── BOTTOM ACTIONS ── */}
        <div className="flex justify-end items-center gap-3 py-4 border-t border-slate-200">
          <button type="button" onClick={onCancel} className="h-10 px-6 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center gap-2">
            <X className="h-4 w-4" /> Cancel
          </button>
          <button type="submit" disabled={isLoading} className="h-10 px-8 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
            <Save className="h-4 w-4" />
            {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
        </div>

      </form>
    </div>
  )
}

/* ── Sub-components ── */

function Section({ icon, iconBg, title, subtitle, children }: {
  icon: React.ReactNode
  iconBg: string
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50/80 to-white">
        <div className={`h-8 w-8 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, error, children }: { label?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</label>}
      {children}
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><span>⚠</span>{error}</p>}
    </div>
  )
}

function ErrorMsg({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-red-500 flex items-center gap-1 mt-1"><span>⚠</span>{children}</p>
}

function Required() {
  return <span className="text-red-400 ml-0.5">*</span>
}

function AddButton({ onClick, children, className = '', small = false }: { onClick: () => void; children: React.ReactNode; className?: string; small?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${small ? 'h-7 px-3 text-xs' : 'h-9 px-4 text-sm'} rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-200 flex items-center gap-1.5 font-medium ${className}`}
    >
      <Plus className={small ? 'h-3 w-3' : 'h-3.5 w-3.5'} /> {children}
    </button>
  )
}

function Toggle({ label, registerProps, color }: { label: string; registerProps: any; color: 'amber' | 'emerald' | 'indigo' }) {
  const colors = {
    amber: 'accent-amber-500',
    emerald: 'accent-emerald-500',
    indigo: 'accent-indigo-500',
  }
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input type="checkbox" {...registerProps} className={`h-4 w-4 rounded ${colors[color]} cursor-pointer`} />
      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors duration-150">{label}</span>
    </label>
  )
}