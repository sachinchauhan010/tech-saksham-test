'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { ROLE } from '@/lib/enum';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, UserPlus, Calendar, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import apiClient from '@/lib/api-client';

interface Event {
  _id: string;
  eventCode: string;
  title: string;
  startDate: string;
  endDate: string;
}

interface Admin {
  _id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  managedEvents?: Array<{
    eventCode: string;
    title: string;
  }>;
}

// Custom zod schemas
const emailSchema = z.string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format');

const phoneSchema = z.string()
  .min(1, 'Phone number is required')
  .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian phone number starting with 6-9');

const editAdminSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  email: emailSchema,
  phone: phoneSchema,
  department: z.string()
    .min(2, 'Department must be at least 2 characters')
    .max(100, 'Department cannot exceed 100 characters')
    .regex(/^[a-zA-Z0-9\s&-]+$/, 'Department can only contain letters, numbers, spaces, hyphens, and ampersands'),
  role: z.enum([ROLE.ADMIN, ROLE.SUPER_ADMIN], {
    required_error: 'Please select a role',
  }),
  managedEvents: z.array(z.string()).min(1, 'Please select at least one event').default([])
});

type EditAdminFormData = z.infer<typeof editAdminSchema>;

export default function EditAdmin() {
  const router = useRouter();
  const params = useParams();
  const { user: currentUser } = useAppSelector((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [notFound, setNotFound] = useState(false);

  const adminId = params.adminId as string;

  // Check if current user is super admin
  const isSuperAdmin = currentUser?.role?.includes(ROLE.SUPER_ADMIN) || false;

  const form = useForm<EditAdminFormData>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
      role: ROLE.ADMIN,
      managedEvents: []
    },
    mode: 'onBlur'
  });

  // Fetch admin data and events on component mount
  useEffect(() => {
    fetchAdminData();
    fetchEvents();
  }, [adminId]);

  const fetchAdminData = async () => {
    try {
      setFetchLoading(true);
      const {data} = await apiClient.get(`/api/admin/manage-admin/${adminId}`);
      
      if (data.success) {
        setAdmin(data.data);
        // Set form values with fetched data
        form.reset({
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          department: data.data.department,
          role: data.data.role,
          managedEvents: data.data.managedEvents?.map((event: any) => event.eventCode) || []
        });
      } else {
        if (data.error?.includes('not found')) {
          setNotFound(true);
        } else {
          toast.error('Failed to fetch admin data');
        }
      }
    } catch (error) {
      toast.error('Error fetching admin data');
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      setEventsLoading(true);
      const {data} = await apiClient.get('/api/event');
      
      if (data.success) {
        // Combine upcoming and past events
        const allEvents = [...(data.data.upcomingEvents || []), ...(data.data.pastEvents || [])];
        setEvents(allEvents);
      } else {
        toast.error('Failed to fetch events');
      }
    } catch (error) {
      toast.error('Error fetching events');
    } finally {
      setEventsLoading(false);
    }
  };

  const onSubmit = async (data: EditAdminFormData) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can edit admin users');
      return;
    }

    try {
      setLoading(true);
      
      const responseData = await apiClient.put(`/api/admin/manage-admin/${adminId}`, {...data});

      if (responseData.data.success) {
        toast.success('Admin user updated successfully');
        router.push('/admin/manage-admin');
      } else {
        toast.error(responseData.data.error || 'Failed to update admin');
      }
    } catch (error) {
      toast.error('Error updating admin');
    } finally {
      setLoading(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <p className="text-sm text-gray-500">Only Super Admins can edit admin users.</p>
          <Button 
            onClick={() => router.push('/admin/manage-admin')} 
            className="mt-4"
          >
            Back to Admin Management
          </Button>
        </div>
      </div>
    );
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin data...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Admin Not Found</h1>
          <p className="text-gray-600">The admin user you're looking for doesn't exist.</p>
          <Button 
            onClick={() => router.push('/admin/manage-admin')} 
            className="mt-4"
          >
            Back to Admin Management
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={() => router.push('/admin/manage-admin')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Admin Management
            </Button>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 rounded-full p-3">
                <Save className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Admin User</h1>
            <p className="text-gray-600">Update administrator information and permissions</p>
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-lg">
          <div className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Personal Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="admin@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter full name"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="9876543210"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Department *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="IT Department"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Role Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Role Assignment
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Role *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select admin role" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ROLE.ADMIN}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                Admin
                              </div>
                            </SelectItem>
                            <SelectItem value={ROLE.SUPER_ADMIN}>
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                Super Admin
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        <p className="text-sm text-gray-500 mt-1">
                          {field.value === ROLE.SUPER_ADMIN 
                            ? "Super Admins have full system access and can manage other admins"
                            : "Admins can manage users, events, and content"
                          }
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Event Assignment */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Event Assignment
                  </h3>
                  
                  <FormField
                    control={form.control}
                    name="managedEvents"
                    render={() => (
                      <FormItem>
                        <FormLabel>Assign Events *</FormLabel>
                        <div className="space-y-3">
                          {eventsLoading ? (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                              Loading events...
                            </div>
                          ) : events.length === 0 ? (
                            <div className="text-sm text-gray-500">
                              No events available. Please create events first.
                            </div>
                          ) : (
                            <div className="grid gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
                              {events.map((event) => (
                                <FormField
                                  key={event._id}
                                  control={form.control}
                                  name="managedEvents"
                                  render={({ field }) => {
                                    return (
                                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value?.includes(event.eventCode)}
                                            onCheckedChange={(checked) => {
                                              return checked
                                                ? field.onChange([...field.value, event.eventCode])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== event.eventCode
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal cursor-pointer">
                                          <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-blue-500" />
                                            <div>
                                              <div className="font-medium">{event.title}</div>
                                              <div className="text-gray-500 text-xs">
                                                {event.eventCode} • {new Date(event.startDate).toLocaleDateString()}
                                              </div>
                                            </div>
                                          </div>
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <FormMessage />
                        <p className="text-sm text-gray-500 mt-1">
                          Select events this admin will manage. Admins can only manage assigned events.
                        </p>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/admin/manage-admin')}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="min-w-[120px]"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </div>
                    ) : (
                      'Update Admin'
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </Card>

        {/* Information Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <div className="p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Admin Permissions</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>Admin:</strong> Can manage users, events, certificates, and content</p>
              {/* <p><strong>Super Admin:</strong> Has full system access including admin management</p> */}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}