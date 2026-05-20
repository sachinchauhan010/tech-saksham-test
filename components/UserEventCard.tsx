'use client';

import { useState } from 'react';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
	CalendarDays,
	Clock3,
	MapPin,
	ArrowRight,
} from 'lucide-react';

import { IEvent } from '@/types/interface';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
} from '@/components/ui/alert-dialog';

import { Button } from '@/components/ui/button';

import apiClient from '@/lib/api-client';

import { useToast } from '@/hooks/use-toast';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';
import { getCurrentUser } from '@/services/authService';

interface UserEventCardProps {
	event: IEvent;
	onApply?: (event: IEvent) => void;
}

export default function UserEventCard({
	event,
	onApply,
}: UserEventCardProps) {
	const router = useRouter();

	const toast = useToast();
	const dispatch = useAppDispatch();

	const { user } = useAppSelector(
		(state) => state.user
	);

	const [isApplying, setIsApplying] = useState(false);
	const [isApplied, setIsApplied] = useState(false);

	const formattedDate = new Date(
		event.startDate
	).toLocaleDateString('en-IN', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	});

	const formattedTime = new Date(
		event.startDate
	).toLocaleTimeString('en-IN', {
		hour: '2-digit',
		minute: '2-digit',
	});

	const isRegistrationOver = () => {
		if (!event.registrationCloseDate) return false;
		return new Date(event.registrationCloseDate) < new Date(); // ✅ fixed
	};

	const isRegistrationStarted = () => {
		if (!event.registrationOpenDate) return true;
		return new Date(event.registrationOpenDate) <= new Date();
	};

	const isEventOver = () => {
		if (!event.endDate) return false;
		return new Date(event.endDate) < new Date();
	};

	const isAlreadyApplied = isApplied || user?.eventApplied?.some(
		(e: any) => e.eventCode === event?.eventCode
	);

	const handleApplyClick = async () => {
		if (isApplied || isApplying) return;

		if (!user) {
			toast.error('Please login to apply for events');
			router.push('/login');
			return;
		}

		if (!isRegistrationStarted()) {
			toast.error('Registration for this event has not started yet');
			return;
		}

		if (isRegistrationOver()) {
			toast.error('Registration period for this event has ended');
			return;
		}

		try {
			setIsApplying(true);

			const { data } = await apiClient.post(
				`/api/event/${event._id}/apply`
			);

			if (!data.success) {
				throw new Error(data.message || 'Failed to apply');
			}

			setIsApplied(true);

			toast.success(data.message || 'Successfully applied for event');

			try {
				const updatedUser = await getCurrentUser();
				if (updatedUser) {
					dispatch(setUser(updatedUser));
				}
			} catch (err) {
				console.error('Failed to refetch user data after applying', err);
			}

			if (onApply) {
				onApply(event);
			} else {
				router.push(`/questions/${event._id}`);
				router.refresh();
			}
		} catch (error: any) {
			toast.error(
				error?.response?.data?.message ||
				error?.message ||
				'Failed to apply for event'
			);
		} finally {
			setIsApplying(false);
		}
	};

	return (
		<Card className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/60 bg-background py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

			{/* Banner */}
			<div className="relative h-52 w-full flex-shrink-0 overflow-hidden">
				<Image
					src={event.bannerImage}
					alt={event.title}
					fill
					className="object-cover transition-transform duration-500 group-hover:scale-105"
				/>

				<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

				<div className="absolute left-4 top-4 flex items-center gap-2">
					<Badge className="rounded-full px-3 py-1 text-xs font-medium">
						{event.category}
					</Badge>

					{event.isFeatured && (
						<Badge
							variant="secondary"
							className="rounded-full px-3 py-1 text-xs"
						>
							Featured
						</Badge>
					)}
				</div>

				<div className="absolute bottom-4 left-4 right-4">
					<h2 className="line-clamp-2 min-h-[60px] text-2xl font-bold text-white">
						{event.title}
					</h2>
				</div>
			</div>

			{/* Content */}
			<div className="flex flex-1 flex-col p-4">

				{/* Description */}
				<p className="min-h-[52px] text-sm leading-relaxed text-muted-foreground">
					{(event.shortDescription || event.description)
						.substring(0, 100)
						.concat('...')}
				</p>

				{/* Meta Info */}
				<div className="mt-5 space-y-3">

					{/* Date */}
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
							<CalendarDays className="h-4 w-4 text-primary" />
						</div>
						<div>
							<p className="font-medium text-foreground">{formattedDate}</p>
							<p className="text-xs text-muted-foreground">Event Date</p>
						</div>
					</div>

					{/* Time */}
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
							<Clock3 className="h-4 w-4 text-primary" />
						</div>
						<div>
							<p className="font-medium text-foreground">{formattedTime}</p>
							<p className="text-xs text-muted-foreground">Start Time</p>
						</div>
					</div>

					{/* Location */}
					<div className="flex items-center gap-3 text-sm text-muted-foreground">
						<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
							<MapPin className="h-4 w-4 text-primary" />
						</div>
						<div>
							<p className="line-clamp-1 font-medium text-foreground">
								{event.location?.venueName || 'Virtual Event'}
							</p>
							<p className="line-clamp-1 text-xs text-muted-foreground">
								{event.location?.city || 'Online'}
							</p>
						</div>
					</div>
				</div>

				{/* Tags */}
				<div className="mt-5 min-h-[56px]">
					{event.tags?.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{event.tags.slice(0, 4).map((tag, index) => (
								<span
									key={index}
									className="rounded-full border bg-muted px-3 py-1 text-xs text-muted-foreground"
								>
									#{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{/* Join Questions button — shown only if already applied */}
				{isAlreadyApplied && (
					isEventOver() ? (
						<Button disabled className="w-full flex-1">
							Event Ended
						</Button>
					) : (
						<Link href={`/questions/${event._id}`} className="flex-1">
							<Button className="w-full">
								Join Questions
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</Link>
					)
				)}

				{/* Footer */}
				<div className="mt-auto flex items-center gap-3 pt-5">

					{/* APPLY BUTTON */}
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								disabled={isApplying || isAlreadyApplied || isRegistrationOver() || !isRegistrationStarted()}
								className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white hover:shadow-md"
							>
								{isApplying
									? 'Applying...'
									: isAlreadyApplied
										? 'Applied'
										: !isRegistrationStarted()
											? 'Registration Not Started'
											: isRegistrationOver()
												? 'Registration Over'
												: 'Apply Now'}

								{!isApplying && isAlreadyApplied && (
									<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
								)}
							</Button>
						</AlertDialogTrigger>

						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>Confirm Event Application</AlertDialogTitle>
								<AlertDialogDescription>
									Are you sure you want to apply for "{event.title}"?
									<br />
									<br />
									You will receive event updates and details via email.
								</AlertDialogDescription>
							</AlertDialogHeader>

							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleApplyClick}>
									Apply Now
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>

					{/* VIEW EVENT */}
					<Link href={`/event/${event._id}`}>
						<Button variant="outline" className="rounded-xl">
							View Event
						</Button>
					</Link>
				</div>
			</div>
		</Card>
	);
}