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

  // RESEND OTP TIMER
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // REGISTRATION FORM
  const form = useForm<IRegisterationForm>({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      department: '',
    },
  });

  // OTP FORM
  const otpForm = useForm<IOTPForm>({
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  // FETCH TODAY EVENTS
  const fetchEvents = async () => {
    try {
      const { data } = await apiClient.get('/api/event');

      if (data.success) {
        const { upcomingEvents } = data.data;

        const todayStr = new Date().toDateString();

        const todayList = upcomingEvents.filter(
          (event: IEvent) =>
            new Date(event.startDate).toDateString() === todayStr
        );

        if (todayList.length === 1) {
          router.push(`/questions/${todayList[0]._id}`);
          return;
        }

        if (todayList.length > 1) {
          router.push('/questions');
          return;
        }

        toast.info('No live events today');
        router.push('/questions');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load events');
      router.push('/questions');
    }
  };

  // FETCH EXISTING USER
  const fetchUserDetails = async ({
    email,
    phone,
  }: {
    email?: string;
    phone?: string;
  }) => {
    try {
      if (!email && !phone) return;

      setIsFetchingUser(true);

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
    } catch (error) {
      setIsUserExist(false);
      setExistingUser(null);
    } finally {
      setIsFetchingUser(false);
    }
  };

  // SEND OTP
  const sendOTP = async (email: string) => {
    setIsSendingOTP(true);

    try {
      // const { data } = await apiClient.post('/api/send-otp', {
      //   email,
      //   otpType: OTP_TYPE.PHONE_NUMBER_VERIFICATION,
      //   isForLogin: false,
      //   isAlreadyExist: isUserExist,
      // });

      const response= await fetch(`https://nicsi.nic.in/nicsi/notification/send-otp`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          
        },
        body:JSON.stringify({
          "mobile": 6393990647,
          "type": "OTP"
        //   email,
        // otpType: OTP_TYPE.PHONE_NUMBER_VERIFICATION,
        // isForLogin: false,
        // isAlreadyExist: isUserExist,
        })
      })

      const data= await response.json();

      console.log(data,'data****************')

      if (!data.success) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      setResendCooldown(120);

      toast.success(data.message || 'OTP sent successfully');

      if (process.env.NODE_ENV !== 'production' && data.otp) {
        toast.info(`Development OTP: ${data.otp}`);
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

  // REGISTER USER
  const registerUser = async (values: IRegisterationForm) => {
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

      dispatch(setUser(data.data || data));

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

  // STEP 1 SUBMIT
  const onFormSubmit = async (values: IRegisterationForm) => {
    setFormData(values);

    if (isForAdmin) {
      const registeredUser = await registerUser(values);

      if (registeredUser && onSuccess) {
        onSuccess(registeredUser._id);
      }

      return;
    }

    const sent = await sendOTP(values.email);

    if (sent) {
      setCurrentStep(2);
    }
  };

  // STEP 2 SUBMIT
  const onOTPSubmit = async (values: IOTPForm) => {
    if (!formData) return;

    setIsVerifyingOTP(true);

    try {
      const { data: verifyData } = await apiClient.post('/api/verify-otp', {
        email: formData.email,
        otp: values.otp,
        OtpType: OTP_TYPE.PHONE_NUMBER_VERIFICATION,
        preExistingUser: isUserExist,
        isForLogin: false,
      });

      if (!verifyData.success) {
        throw new Error(verifyData.error || 'OTP verification failed');
      }

      let finalUser;

      if (isUserExist && existingUser) {
        if (eventId) {
          await registerUser(formData);
        }

        finalUser = existingUser;
        dispatch(setUser(existingUser));
      } else {
        finalUser = await registerUser(formData);
      }

      if (!finalUser) {
        throw new Error('Authentication failed');
      }

      toast.success('Login successful!');

      await fetchEvents();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Verification failed'
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // STEP INDICATOR
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

  // PERSONAL DETAILS FORM
  const renderPersonalDetailsForm = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onFormSubmit)}
        className="space-y-4"
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#245cf0] to-[#0f97cb] text-white">
            <User className="h-4 w-4" />
          </div>

          <h2 className="text-3xl font-bold text-[#0d83c0]">
            Personal Details
          </h2>
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
              message: 'phone number should start from 6 to 9 and must be 10 digits',
            },
            minLength: {
              value: 10,
              message: 'Phone number must be exactly 10 digits',
            },
            maxLength: {
              value: 10,
              message: 'Phone number must be exactly 10 digits',
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
                      // Allow only digits
                      const digits = e.target.value.replace(/\D/g, '');
                      field.onChange(digits);
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
            minLength: {
              value: 2,
              message: 'Name must be at least 2 characters',
            },
            maxLength: {
              value: 100,
              message: 'Name must not exceed 100 characters',
            },
            validate: (value) =>
              value.trim().length >= 2 || 'Name cannot be only spaces',
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
            minLength: {
              value: 2,
              message: 'Department must be at least 2 characters',
            },
            maxLength: {
              value: 150,
              message: 'Department must not exceed 150 characters',
            },
            validate: (value) =>
              value.trim().length >= 2 || 'Department cannot be only spaces',
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
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full rounded-2xl"
              >
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

  // OTP FORM
  const renderOTPVerification = () => (
    <Form {...otpForm}>
      <form
        onSubmit={otpForm.handleSubmit(onOTPSubmit)}
        className="space-y-4"
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#245cf0] to-[#0f97cb] text-white">
            <Mail className="h-4 w-4" />
          </div>

          <h2 className="text-3xl font-bold text-[#0d83c0]">
            OTP Verification
          </h2>
        </div>

        <div className="mb-6 text-center">
          <p className="text-slate-600">
            We've sent OTP to{' '}
            <span className="font-semibold text-blue-600">
              {formData?.email}
            </span>
          </p>
        </div>

        <FormField
          control={otpForm.control}
          name="otp"
          rules={{
            required: 'OTP is required',
            minLength: {
              value: 6,
              message: 'OTP must be exactly 6 digits',
            },
            maxLength: {
              value: 6,
              message: 'OTP must be exactly 6 digits',
            },
            pattern: {
              value: /^\d{6}$/,
              message: 'OTP must contain only digits',
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
                    // Allow only digits
                    const digits = e.target.value.replace(/\D/g, '');
                    field.onChange(digits);
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
            onClick={() => sendOTP(formData?.email || '')}
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