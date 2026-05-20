'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { IEvent } from '@/types/interface';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Eye, CalendarDays, MapPin, Hash, ShieldCheck, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function AssignEventsPage() {
	const [events, setEvents] = useState<IEvent[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [updatingEvent, setUpdatingEvent] = useState<string | null>(null);

	useEffect(() => {
		fetchAssignedEvents();
	}, []);

	const fetchAssignedEvents = async () => {
		setIsLoading(true);
		try {
			const { data } = await apiClient.get('/api/admin/assigned-event');

			if (data.success) {
				setEvents(data.events || []);
			} else {
				toast.error(data.message || 'Failed to fetch assigned events');
			}
		} catch (error) {
			toast.error('Error fetching assigned events');
		} finally {
			setIsLoading(false);
		}
	};

	const handleToggleSetting = async (eventId: string, field: 'isIdCardIssue' | 'isCertificateIssue', value: boolean) => {
		setUpdatingEvent(eventId);
		try {
			const endpoint = field === 'isIdCardIssue'
				? `/api/admin/manage-event/${eventId}/issue-id-card`
				: `/api/admin/manage-event/${eventId}/issue-certificate`;

			const { data } = await apiClient.post(endpoint);

			if (data.success) {
				// Update the event in local state - the API toggles the value, so we set it to the opposite
				setEvents(prevEvents =>
					prevEvents.map(event =>
						event._id === eventId ? { ...event, [field]: !event[field] } : event
					)
				);
				toast.success(`${field === 'isIdCardIssue' ? 'ID Card' : 'Certificate'} ${!value ? 'enabled' : 'disabled'} for event`);
			} else {
				toast.error(data.message || 'Failed to update event setting');
			}
		} catch (error) {
			toast.error('Error updating event setting');
		} finally {
			setUpdatingEvent(null);
		}
	};

	return (
		<section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-[#0f5fc3]">Assign Events</h1>
				<p className="mt-1 text-muted-foreground">Manage ID card and certificate settings for your assigned events</p>
			</div>

			{isLoading ? (
				<div className="flex justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
				</div>
			) : events.length === 0 ? (
				<Card className="p-12 text-center">
					<p className="text-muted-foreground">No events assigned to you yet.</p>
				</Card>
			) : (
				<div className="space-y-4">
					{events.map((event) => (
						<Card key={event._id} className="relative overflow-hidden border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200">
							{/* Top accent bar */}
							<div className="h-1.5 w-full bg-gradient-to-r from-[#0f5fc3] to-[#3b82f6]" />

							<div className="p-6">
								<div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

									{/* Event Details */}
									<div className="flex-1 space-y-4">
										<div>
											<div className="flex items-center gap-3 mb-2">
												<h3 className="text-xl font-bold text-slate-900">{event.title}</h3>
												<Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 uppercase text-[10px] tracking-wider">
													{event.format || 'Event'}
												</Badge>
											</div>

											<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
												<div className="flex items-center text-sm text-slate-600 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
													<Hash className="h-4 w-4 text-[#0f5fc3]" />
													<span className="font-medium">{event.eventCode}</span>
												</div>
												<div className="flex items-center text-sm text-slate-600 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
													<CalendarDays className="h-4 w-4 text-[#0f5fc3]" />
													<span className="font-medium">
														{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
													</span>
												</div>
												<div className="flex items-center text-sm text-slate-600 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100 sm:col-span-2">
													<MapPin className="h-4 w-4 text-[#0f5fc3] shrink-0" />
													<span className="font-medium truncate">{event.location?.venueName || 'Virtual Event'}</span>
												</div>
											</div>
										</div>
									</div>

									{/* Toggles & Actions */}
									<div className="flex flex-col gap-4 min-w-[280px]">
										<div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
											<div className="flex items-center justify-between gap-4">
												<div className="flex items-center gap-2">
													<div className="p-1.5 bg-blue-100 rounded-md">
														<ShieldCheck className="h-4 w-4 text-blue-700" />
													</div>
													<div>
														<label className="text-sm font-semibold text-slate-900 leading-none">ID Cards</label>
														<p className="text-[11px] text-slate-500 mt-0.5">Enable generation</p>
													</div>
												</div>
												<Switch
													checked={event.isIdCardIssue || false}
													onCheckedChange={(checked) => event._id && handleToggleSetting(event._id, 'isIdCardIssue', checked)}
													disabled={updatingEvent === event._id}
													className="data-[state=checked]:bg-[#0f5fc3]"
												/>
											</div>

											<div className="h-px w-full bg-slate-200" />

											<div className="flex items-center justify-between gap-4">
												<div className="flex items-center gap-2">
													<div className="p-1.5 bg-green-100 rounded-md">
														<Ticket className="h-4 w-4 text-green-700" />
													</div>
													<div>
														<label className="text-sm font-semibold text-slate-900 leading-none">Certificates</label>
														<p className="text-[11px] text-slate-500 mt-0.5">Enable generation</p>
													</div>
												</div>
												<Switch
													checked={event.isCertificateIssue || false}
													onCheckedChange={(checked) => event._id && handleToggleSetting(event._id, 'isCertificateIssue', checked)}
													disabled={updatingEvent === event._id}
													className="data-[state=checked]:bg-[#0f5fc3]"
												/>
											</div>
										</div>


										<div className='flex justify-center itenms-center gap-10'>
											<Link href={`/admin/assigned-events/${event._id}/register-participants`} className="w-full">
												<Button variant="outline" className="w-full border-blue-200 text-[#0f5fc3] hover:bg-blue-50 hover:text-[#0d4fa3] transition-colors">
													<Eye className="mr-2 h-4 w-4" />
													Register Participants
												</Button>
											</Link>

											<Link href={`/admin/manage-event/${event._id}`} className="w-full">
												<Button variant="outline" className="w-full border-blue-200 text-[#0f5fc3] hover:bg-blue-50 hover:text-[#0d4fa3] transition-colors">
													<Eye className="mr-2 h-4 w-4" />
													View Event Details
												</Button>
											</Link>
										</div>
									</div>

								</div>
							</div>
						</Card>
					))}
				</div>
			)}
		</section>
	);
}