'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Edit2, Trash2, Plus, Eye, Search, ChevronUp, ChevronDown, ChevronsUpDown, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EVENT_CATEGORY, EVENT_STATUS } from '@/lib/enum'
import GridView from '@/components/admin/GridView'
import TableView, { TableColumn } from '@/components/admin/TableView'
import EventCard from '@/components/admin/EventCard'
import { IEvent } from '@/types/interface'
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
import apiClient from '@/lib/api-client'

// ─── Types ────────────────────────────────────────────────────────────────────
type SortField = 'eventCode' | 'title' | 'startDate' | 'endDate'
type SortDirection = 'asc' | 'desc' | null

interface SortState {
  field: SortField | null
  direction: SortDirection
}

interface EventListProps {
  events: IEvent[]
  onDelete: (eventId: string) => void
  onView: (event: IEvent) => void
  isLoading?: boolean
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────
function SortIcon({ field, sort }: { field: SortField; sort: SortState }) {
  if (sort.field !== field) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 text-gray-400 inline" />
  if (sort.direction === 'asc') return <ChevronUp className="ml-1 h-3.5 w-3.5 text-blue-600 inline" />
  return <ChevronDown className="ml-1 h-3.5 w-3.5 text-blue-600 inline" />
}

// ─── Sortable Header ──────────────────────────────────────────────────────────
function SortableHead({
  field,
  label,
  sort,
  onSort,
  className,
}: {
  field: SortField
  label: string
  sort: SortState
  onSort: (field: SortField) => void
  className?: string
}) {
  const isActive = sort.field === field
  return (
    <div
      className={`cursor-pointer select-none whitespace-nowrap inline-flex items-center gap-0.5 hover:text-gray-700 ${className ?? ''}`}
      onClick={() => onSort(field)}
    >
      <span className={`${isActive ? 'text-blue-600 font-semibold' : ''}`}>
        {label}
      </span>
      <SortIcon field={field} sort={sort} />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EventList({ events, onDelete, onView, isLoading = false }: EventListProps) {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [eventToDelete, setEventToDelete] = useState<string | null>(null)
  const [sort, setSort] = useState<SortState>({ field: null, direction: null })
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid')

  const eventsPerPage = 10

  // ── Sort handler: cycles asc → desc → none ──────────────────────────────────
  const handleSort = (field: SortField) => {
    setSort((prev) => {
      if (prev.field !== field) return { field, direction: 'asc' }
      if (prev.direction === 'asc') return { field, direction: 'desc' }
      return { field: null, direction: null }
    })
    setCurrentPage(1)
  }

  const safeFormatDate = (date: Date | string | undefined | null, formatString = 'MMM dd, yyyy') => {
    if (!date) return 'N/A'
    const d = new Date(date)
    return isNaN(d.getTime()) ? 'Invalid Date' : format(d, formatString)
  }

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      searchTerm === '' ||
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === '' || event.category === filterCategory
    const matchesStatus = filterStatus === '' || event.status === filterStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  // ── Sort ────────────────────────────────────────────────────────────────────
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!sort.field || !sort.direction) return 0

    let valA: string | number = ''
    let valB: string | number = ''

    if (sort.field === 'startDate' || sort.field === 'endDate') {
      valA = new Date(a[sort.field] ?? 0).getTime()
      valB = new Date(b[sort.field] ?? 0).getTime()
    } else {
      valA = (a[sort.field] ?? '').toString().toLowerCase()
      valB = (b[sort.field] ?? '').toString().toLowerCase()
    }

    if (valA < valB) return sort.direction === 'asc' ? -1 : 1
    if (valA > valB) return sort.direction === 'asc' ? 1 : -1
    return 0
  })

  // ── Paginate ────────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(sortedEvents.length / eventsPerPage)
  const currentEvents = sortedEvents.slice(
    (currentPage - 1) * eventsPerPage,
    currentPage * eventsPerPage
  )

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (eventCode: string) => {
    setEventToDelete(eventCode)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (eventToDelete) {
      setIsDeleteDialogOpen(false)
      onDelete(eventToDelete)
      setEventToDelete(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      ongoing: 'bg-blue-100 text-blue-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] ?? 'bg-gray-100 text-gray-800'
  }

  const eventColumns: TableColumn<IEvent>[] = [
    { 
      header: <SortableHead field="eventCode" label="Event Code" sort={sort} onSort={handleSort} />,
      key: 'eventCode',
      className: 'font-medium',
    },
    { 
      header: <SortableHead field="title" label="Title" sort={sort} onSort={handleSort} />,
      key: 'title',
      render: (event) => (
        <div className="max-w-xs truncate" title={event.title}>
          {event.title}
        </div>
      )
    },
    { header: 'Organizer', key: 'organizer', render: (event) => <UserAvatarGroup users={event.organizer || []} maxVisible={2} /> },
    { 
      header: 'Status', 
      key: 'status', 
      render: (event) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
          {event.status}
        </span>
      )
    },
    { 
      header: <SortableHead field="startDate" label="Start Date" sort={sort} onSort={handleSort} />, 
      key: 'startDate', 
      render: (event) => safeFormatDate(event.startDate) 
    },
    { 
      header: <SortableHead field="endDate" label="End Date" sort={sort} onSort={handleSort} />, 
      key: 'endDate', 
      render: (event) => safeFormatDate(event.endDate) 
    },
    {
      header: 'Actions',
      key: 'actions',
      className: 'text-right',
      render: (event) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/manage-event/${event._id}`)} className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/admin/manage-event/edit/${event._id}`)} className="h-8 w-8 p-0">
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => event._id && handleDelete(event._id)} className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-2xl font-bold">
            Events ({filteredEvents.length})
          </CardTitle>
          <Button
            onClick={() => router.push('/admin/manage-event/create')}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Event
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="pl-10"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1) }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">All Categories</option>
            {Object.values(EVENT_CATEGORY).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1) }}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm"
          >
            <option value="">All Status</option>
            {Object.values(EVENT_STATUS).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Clear sort */}
          {sort.field && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSort({ field: null, direction: null })}
              className="text-xs text-gray-500"
            >
              Clear sort
            </Button>
          )}

          <div className="flex items-center bg-slate-100/80 rounded-xl p-1 shadow-inner border border-slate-200 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`h-8 w-8 p-0 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 hover:bg-white hover:text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode('table')}
              className={`h-8 w-8 p-0 rounded-lg transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60 hover:bg-white hover:text-blue-700' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Loading events...
          </div>
        ) : currentEvents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">
              {searchTerm || filterCategory || filterStatus
                ? 'No events found matching your criteria.'
                : 'No events created yet.'}
            </p>
            {!searchTerm && !filterCategory && !filterStatus && (
              <Button
                onClick={() => router.push('/admin/manage-event/create')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Your First Event
              </Button>
            )}
          </div>
        ) : viewMode === 'grid' ? (
          <GridView 
            data={currentEvents}
            keyExtractor={(event) => event._id || event.eventCode}
            renderItem={(event) => (
              <EventCard 
                event={event}
                onView={(e) => router.push(`/admin/manage-event/${e._id}`)}
                onEdit={(id) => router.push(`/admin/manage-event/edit/${id}`)}
                onDelete={(id) => handleDelete(id)}
                getStatusBadge={getStatusBadge}
              />
            )}
          />
        ) : (
          <div className="overflow-x-auto">
            <TableView 
              data={currentEvents}
              columns={eventColumns}
              keyExtractor={(event) => event._id || event.eventCode}
            />
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{eventToDelete}"? This action cannot be undone.
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
                  Yes, Delete
                </Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
      </CardContent>
    </Card>
  )
}