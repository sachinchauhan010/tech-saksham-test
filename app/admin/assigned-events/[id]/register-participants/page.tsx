'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Mail, ArrowRight, User, Phone, Building2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useParams } from 'next/navigation';

interface FormValues {
	name: string;
	email: string;
	phone: string;
	department: string;
}

export default function RegisterPage() {
	const toast = useToast();
	const params = useParams();
	const eventId = params.id as string;

	const [isLoading, setIsLoading] = useState(false);
	const [isFetchingUser, setIsFetchingUser] = useState(false);

	const form = useForm<FormValues>({
		defaultValues: {
			name: '',
			email: '',
			phone: '',
			department: '',
		},
	});

	const fetchUserDetails = async ({ email, phone }: { email?: string; phone?: string; }) => {
		try {
			if (!email && !phone) return;
			setIsFetchingUser(true);
			const query = new URLSearchParams();
			if (email) query.append('email', email);
			if (phone) query.append('phone', phone);

			const { data } = await apiClient.get(`/api/users/lookup?${query.toString()}`);

			if (data.success && data.data) {
				const user = data.data;
				form.setValue('name', user.name || '');
				form.setValue('email', user.email || '');
				form.setValue('phone', user.phone || '');
				form.setValue('department', user.department || '');
				toast.success('User details auto-filled');
			}
		} catch (error) {
			// silently ignore if user not found
		} finally {
			setIsFetchingUser(false);
		}
	};

	const completeRegistration = async (values: FormValues) => {
		if (!eventId) {
			toast.error('Event ID is missing from URL');
			return;
		}

		setIsLoading(true);
		try {
			const {data} = await apiClient.post(`/api/admin/assigned-event/${eventId}/register`, { ...values, emailVerified: true });
			console.log("Data", data);
			
			if (!data.success) {
				toast.error(data.error || 'Registration failed');
				return;
			}

			form.reset();
			toast.success('Participant registered successfully for this event!');
		} catch (error: any) {
			console.error("Error", error);
			const errMsg = error?.response?.data?.error || error.message;
			if(errMsg?.includes('409') || errMsg?.includes('already')) {
				toast.error('User already registered for this event');
			} else {
				toast.error(errMsg || 'Registration failed');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-[#0f5fc3]">Register Participants</h1>
				<p className="mt-1 text-muted-foreground">Register a participant for this specific event</p>
			</div>

			<div className="flex items-center justify-center p-4">
				<Card className="w-full max-w-xl rounded-2xl border border-blue-200 bg-white shadow-xl">
					<div className="p-6 sm:p-8 space-y-6">

						<Form {...form}>
							<form onSubmit={form.handleSubmit(completeRegistration)} className="space-y-4">
								<div className="mb-2 flex items-center gap-3">
									<div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#245cf0] to-[#0f97cb] text-white">
										<User className="h-4 w-4" />
									</div>
									<h2 className="text-3xl font-bold text-[#0d83c0]">Registration</h2>
								</div>

								<FormField
									control={form.control}
									name="email"
									rules={{
										required: 'Email is required',
										pattern: {
											value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
											message: 'Invalid email address',
										},
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-slate-700">
												Email ID <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
													<Input
														type="email"
														placeholder="your.email@example.com"
														className="h-12 rounded-2xl border-blue-200 pl-10 placeholder:text-slate-400 focus-visible:ring-blue-400"
														{...field}
														onBlur={(e) => {
															field.onBlur();
															fetchUserDetails({ email: e.target.value });
														}}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="phone"
									rules={{
										required: 'Phone number is required',
										pattern: {
											value: /^[5-9]\d{9}$/,
											message: 'Phone must be 10 digits and start with 5, 6, 7, 8, or 9',
										},
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-slate-700">
												Mobile Number <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
													<Input
														type="tel"
														placeholder="10-digit mobile number"
														maxLength={10}
														className="h-12 rounded-2xl border-blue-200 pl-10 placeholder:text-slate-400 focus-visible:ring-blue-400"
														{...field}
														onBlur={(e) => {
															field.onBlur();
															if (e.target.value.length === 10) {
																fetchUserDetails({ phone: e.target.value });
															}
														}}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="name"
									rules={{
										required: 'Name is required',
										minLength: { value: 2, message: 'Name must be at least 2 characters' },
										maxLength: { value: 25, message: 'Name must be at most 25 characters' },
										pattern: { value: /^[A-Za-z\s]+$/, message: 'Name must contain only letters' },
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-slate-700">
												Full Name <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
													<Input
														placeholder="Enter your full name"
														className="h-12 rounded-2xl border-blue-200 pl-10 placeholder:text-slate-400 focus-visible:ring-blue-400"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="department"
									rules={{
										required: 'Department is required',
										maxLength: { value: 25, message: 'Department must be at most 25 characters' },
									}}
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-sm font-semibold text-slate-700">
												Ministry / Department / Organization <span className="text-red-500">*</span>
											</FormLabel>
											<FormControl>
												<div className="relative">
													<Building2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
													<Input
														placeholder="Enter your organization"
														className="h-12 rounded-2xl border-blue-200 pl-10 placeholder:text-slate-400 focus-visible:ring-blue-400"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type="submit"
									disabled={isLoading || isFetchingUser}
									className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#245cf0] to-[#0f97cb] text-base font-semibold text-white hover:from-[#1748cc] hover:to-[#0d83ae]"
								>
									{isLoading || isFetchingUser ? 'Processing...' : 'Register Now'}
									<ArrowRight className="ml-2 h-4 w-4" />
								</Button>
							</form>
						</Form>

						<div className="text-center text-sm text-muted-foreground">
							Already registered?{' '}
							<Link href="/q&a" className="text-primary hover:underline">
								View Questions
							</Link>
						</div>

					</div>
				</Card>
			</div>
		</section>
	);
}
