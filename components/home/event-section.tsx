import { useEffect, useState } from "react";
import EventCard from "../event/EventCard";
import { IEvent } from "@/types/interface";
import apiClient from "@/lib/api-client";

export default function EventSection() {

	const [upcommingEvents, setUpcomingEvents] = useState<IEvent[]>([]);
	const [completedEvents, setCompletedEvents] = useState<IEvent[]>([]);

	const fetchEvents = async () => {
		try {
			const { data } = await apiClient.get('/api/event');
			if (data.success) {
				setUpcomingEvents(data.data.upcomingEvents || []);
				setCompletedEvents(data.data.pastEvents || []);
			}
		} catch (error) {
			console.error('Error fetching events', error);
		}
	}

	useEffect(() => {
		fetchEvents();
	}, [])

	return (
		<section className="py-24 bg-slate-50">
			<div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<h2 className="text-3xl font-bold text-gray-900 md:text-4xl mb-4">Upcoming Events</h2>
					<p className="text-gray-600">Join us for our upcoming events and workshops</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{upcommingEvents.length > 0 ? (
						upcommingEvents.map((event) => (
							<EventCard key={event._id} event={event} />
						))
					) : (
						<p className="text-gray-600 text-center">No upcoming events found</p>
					)}
				</div>
			</div>

			{
				completedEvents.length > 0 && (
					<div>
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold text-gray-900 md:text-4xl my-4">Recently Completed Events</h2>
							<p className="text-gray-600">Here are some of our recently completed events and workshops</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
							{completedEvents.map((event) => (
								<EventCard key={event._id} event={event} />
							))}
						</div>
					</div>
				)
			}
		</section>
	)
}