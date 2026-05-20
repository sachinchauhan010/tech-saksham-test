'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Mail,
  ArrowLeft,
  ArrowRight,
  User,
  Phone,
  Building2,
} from 'lucide-react';

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

import {
  IRegisterationForm,
  IOTPForm,
  IEvent,
} from '@/types/interface';

import { OTP_TYPE } from '@/lib/enum';
import apiClient from '@/lib/api-client';

import { useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';
import { getCurrentUser } from '@/services/authService';

// ─── Constants ────────────────────────────────────────────────────────────────

const RESEND_COOLDOWN_SECONDS = 120;
const NOTIFICATION_API = process.env.NEXT_PUBLIC_NOTIFICATION_API_URL;

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegistrationFormProps {
  isForAdmin?: boolean;
  onSuccess?: (userId: string) => void;
  redirectUrl?: string;
  showNavigation?: boolean;
  eventId?: string;
}

export default function RegistrationForm({
  isForAdmin = false,
  onSuccess,
  redirectUrl = '/questions',
  showNavigation = true,
  eventId,
}: RegistrationFormProps) {
  const toast = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<IRegisterationForm | null>(null);
  const [isUserExist, setIsUserExist] = useState(false);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ─── Resend timer ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  // ─── Forms ──────────────────────────────────────────────────────────────────

  const form = useForm<IRegisterationForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
    },
  });

  const otpForm = useForm<IOTPForm>({
    mode: 'onChange',
    defaultValues: { otp: '' },
  });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  /**
   * THE FIX:
   * Always fetch the latest user from the server after registration/login
   * before doing any redirect. The Redux store may have a stale user object
   * that doesn't include the newly added eventApplied entry, which causes
   * the access check in QuestionsPanelPage to wrongly block the user.
   */
  const syncUserAndRedirect = async () => {
    try {
      const freshUser = await getCurrentUser();
      dispatch(setUser(freshUser));
      await redirectAfterAuth(freshUser);
    } catch {
      toast.error('Failed to load user session. Please refresh.');
    }
  };

  const redirectAfterAuth = async (currentUser: any) => {
    try {
      // If registering for a specific event, go there directly —
      // no need to check today's events list
      if (eventId) {
        router.push(`/questions/${eventId}`);
        return;
      }

      const { data } = await apiClient.get('/api/event');

      if (!data.success) {
        router.push('/questions');
        return;
      }

      const { upcomingEvents } = data.data;
      const todayStr = new Date().toDateString();

      const todayList: IEvent[] = upcomingEvents.filter(
        (event: IEvent) =>
          new Date(event.startDate).toDateString() === todayStr
      );

      if (todayList.length === 1) {
        const hasApplied = currentUser?.eventApplied?.some(
          (e: any) => e.eventCode === todayList[0].eventCode
        );

        if (hasApplied) {
          router.push(`/questions/${todayList[0]._id}`);
          return;
        }
      }

      if (todayList.length > 1) {
        router.push('/questions');
        return;
      }

      toast.info('No live events today');
      router.push('/questions');
    } catch {
      toast.error('Failed to load events');
      router.push('/questions');
    }
  };

  // ─── API calls ──────────────────────────────────────────────────────────────

  const fetchUserDetails = async ({
    email,
    phone,
  }: {
    email?: string;
    phone?: string;
  }) => {
    if (!email && !phone) return;

    setIsFetchingUser(true);

    try {
      const query = new URLSearchParams();
      if (email) query.append('email', email);
      if (phone) query.append('phone', phone);

      const { data } = await apiClient.get(
        `/api/users/lookup?${query.toString()}`
      );

      if (data.success && data.data) {
        const user = data.data;

        form.setValue('name', user.name || '');
        form.setValue('email', user.email || '');
        form.setValue('phone', user.phone || '');
        form.setValue('department', user.department || '');

        setIsUserExist(true);
        setExistingUser(user);

        toast.success('User details auto-filled');
      }
    } catch {
      setIsUserExist(false);
      setExistingUser(null);
    } finally {
      setIsFetchingUser(false);
    }
  };

  const sendOTP = async (phone: string): Promise<boolean> => {
    setIsSendingOTP(true);

    try {
      const res = await fetch(`${NOTIFICATION_API}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: phone, type: 'OTP' }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success('OTP sent successfully');

      if (process.env.NODE_ENV !== 'production' && data.otp) {
        toast.info(`Dev OTP: ${data.otp}`);
      }

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to send OTP'
      );
      return false;
    } finally {
      setIsSendingOTP(false);
    }
  };

  const registerUser = async (values: IRegisterationForm): Promise<any> => {
    setIsLoading(true);

    try {
      let apiUrl = isForAdmin ? '/api/admin/register' : '/api/register';

      if (eventId) {
        apiUrl = `/api/event/${eventId}/register`;
      }

      const { data } = await apiClient.post(apiUrl, values);

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      return data.data || data;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Registration failed'
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step handlers ──────────────────────────────────────────────────────────

  const onFormSubmit = async (values: IRegisterationForm) => {
    setFormData(values);

    if (isForAdmin) {
      const registeredUser = await registerUser(values);
      if (registeredUser && onSuccess) {
        onSuccess(registeredUser._id);
      }
      return;
    }

    const sent = await sendOTP(values.phone);
    if (sent) setCurrentStep(2);
  };

  const onOTPSubmit = async (values: IOTPForm) => {
    if (!formData) return;

    setIsVerifyingOTP(true);

    try {
      // 1. Verify OTP
      const res = await fetch(`${NOTIFICATION_API}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: formData.phone,
          otp: values.otp,
        }),
      });

      const verifyData = await res.json();

      if (!verifyData.success) {
        throw new Error(verifyData.message || 'OTP verification failed');
      }

      // 2. Register new user or link existing user to the event
      if (isUserExist && existingUser) {
        if (eventId) {
          const registered = await registerUser(formData);
          if (!registered) throw new Error('Failed to register for event');
        }
      } else {
        const newUser = await registerUser(formData);
        if (!newUser) throw new Error('Registration failed');
      }

      toast.success('Registration successful!');

      // 3. KEY FIX: fetch the fresh user from DB → update Redux → then redirect.
      await syncUserAndRedirect();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Verification failed'
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Personal Details' },
      { number: 2, label: 'OTP Verification' },
    ];

    return (
      <div className="mb-6 flex justify-center">
        <div className="flex items-center gap-4 rounded-lg px-4 py-2">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300
                    ${
                      currentStep >= step.number
                        ? 'bg-[#1477e6] text-white shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                >
                  {step.number}
                </div>

                <span
                  className={`mt-1 text-[11px]
                    ${
                      currentStep >= step.number
                        ? 'font-medium text-[#1477e6]'
                        : 'text-slate-400'
                    }`}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`mx-2 mb-5 h-[2px] w-12
                    ${currentStep > step.number ? 'bg-[#1477e6]' : 'bg-slate-300'}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderPersonalDetailsForm = () => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#245cf0] to-[#0f97cb] text-white">
            <User className="h-4 w-4" />
          </div>
          <h2 className="text-3xl font-bold text-[#0d83c0]">Personal Details</h2>
        </div>

        {/* EMAIL */}
        <FormField
          control={form.control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: 'Enter a valid email address',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    className="h-12 rounded-2xl pl-10"
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

        {/* PHONE */}
        <FormField
          control={form.control}
          name="phone"
          rules={{
            required: 'Phone number is required',
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Enter a valid 10-digit Indian mobile number',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="h-12 rounded-2xl pl-10"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e.target.value.replace(/\D/g, ''));
                    }}
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

        {/* NAME */}
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: 'Full name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 100, message: 'Name must not exceed 100 characters' },
            validate: (v) => v.trim().length >= 2 || 'Name cannot be only spaces',
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
                  <Input
                    placeholder="Enter your full name"
                    className="h-12 rounded-2xl pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* DEPARTMENT */}
        <FormField
          control={form.control}
          name="department"
          rules={{
            required: 'Ministry / Department / Organization is required',
            minLength: { value: 2, message: 'Department must be at least 2 characters' },
            maxLength: { value: 150, message: 'Department must not exceed 150 characters' },
            validate: (v) => v.trim().length >= 2 || 'Department cannot be only spaces',
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ministry / Department / Organization</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />
                  <Input
                    placeholder="Enter your organization"
                    className="h-12 rounded-2xl pl-10"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3">
          {showNavigation && (
            <Link href="/" className="flex-1">
              <Button type="button" variant="outline" className="h-12 w-full rounded-2xl">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          )}

          <Button
            type="submit"
            className="h-12 flex-1 rounded-2xl"
            disabled={isSendingOTP || isFetchingUser || isLoading}
          >
            {isSendingOTP ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Sending OTP...
              </>
            ) : (
              <>
                {isFetchingUser ? 'Fetching User...' : 'Send OTP'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  const renderOTPVerification = () => (
    <Form {...otpForm}>
      <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-4">
        <div className="mb-2 flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#245cf0] to-[#0f97cb] text-white">
            <Mail className="h-4 w-4" />
          </div>
          <h2 className="text-3xl font-bold text-[#0d83c0]">OTP Verification</h2>
        </div>

        <div className="mb-6 text-center">
          <p className="text-slate-600">
            We've sent an OTP to{' '}
            <span className="font-semibold text-blue-600">{formData?.phone}</span>
          </p>
        </div>

        <FormField
          control={otpForm.control}
          name="otp"
          rules={{
            required: 'OTP is required',
            pattern: {
              value: /^\d{6}$/,
              message: 'OTP must be exactly 6 digits',
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Enter OTP</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  className="h-12 rounded-2xl text-center text-lg font-mono"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value.replace(/\D/g, ''));
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-center">
          <Button
            type="button"
            variant="link"
            onClick={() => sendOTP(formData?.phone || '')}
            disabled={resendCooldown > 0 || isSendingOTP}
          >
            {resendCooldown > 0
              ? `Resend OTP in ${resendCooldown}s`
              : 'Resend OTP'}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="h-12 flex-1 rounded-2xl"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <Button
            type="submit"
            className="h-12 flex-1 rounded-2xl"
            disabled={isVerifyingOTP}
          >
            {isVerifyingOTP ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Verifying...
              </>
            ) : (
              <>
                Verify OTP
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );

  return (
    <div className="mx-auto w-full max-w-md p-6">
      {renderStepIndicator()}
      <Card className="border-blue-100 shadow-lg">
        <div className="p-8">
          {currentStep === 1 && renderPersonalDetailsForm()}
          {currentStep === 2 && renderOTPVerification()}
        </div>
      </Card>
    </div>
  );
}