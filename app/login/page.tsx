'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

import { useForm } from 'react-hook-form';

import { useToast } from '@/hooks/use-toast';


import {
  Mail,
  ArrowLeft,
  QrCode,
} from 'lucide-react';

import Image from 'next/image';

import {
  useAppDispatch,
} from '@/redux/hooks';

import { getCurrentUser } from '@/services/authService';

import { setUser } from '@/redux/slices/authSlice';

import { OTP_TYPE } from '@/lib/enum';

import apiClient from '@/lib/api-client';

import ComponentWrapper from '@/components/ComponentWrapper';

import { IEvent } from '@/types/interface';

interface LoginFormValues {
  userPhoneOrEmail: string;
}

interface OTPFormValues {
  otp: string;
}

export default function UserLoginPage() {
  const router = useRouter();

  const toast = useToast();

  const dispatch = useAppDispatch();

  const [currentStep, setCurrentStep] =
    useState<1 | 2>(1);

  const [isSendingOTP, setIsSendingOTP] =
    useState(false);

  const [isVerifyingOTP, setIsVerifyingOTP] =
    useState(false);

  const [userEmail, setUserEmail] =
    useState<string>('');

  const [userOtpType, setUserOtpType] =
    useState<string>(OTP_TYPE.EMAIL_VERIFICATION);

  const [resendCooldown, setResendCooldown] =
    useState(0);

  // RESEND OTP TIMER
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // LOGIN FORM
  const form = useForm<LoginFormValues>({
    mode: 'onBlur',
    defaultValues: {
      userPhoneOrEmail: '',
    },
  });

  // OTP FORM
  const otpForm = useForm<OTPFormValues>({
    mode: 'onChange',
    defaultValues: {
      otp: '',
    },
  });

  // REDIRECT TO TODAY EVENT
  const redirectToTodayEvent = async (
    currentUser: any
  ) => {
    try {
      const { data } = await apiClient.get(
        '/api/event'
      );

      if (!data.success) {
        router.push('/questions');
        return;
      }

      const { upcomingEvents } = data.data;

      const todayStr =
        new Date().toDateString();

      const todayEvents =
        upcomingEvents.filter(
          (event: IEvent) =>
            new Date(
              event.startDate
            ).toDateString() === todayStr
        );

      // SUPER ADMIN
      if (
        currentUser.role === 'super_admin'
      ) {
        router.push(
          '/admin/super-dashboard'
        );

        return;
      }

      // ADMIN
      if (currentUser.role === 'admin') {
        router.push('/admin/dashboard');

        return;
      }

      // FIND APPLIED EVENT
      const appliedTodayEvent =
        todayEvents.find((event: IEvent) =>
          currentUser?.eventApplied?.some(
            (e: any) =>
              e.eventCode ===
              event.eventCode
          )
        );

      // DIRECT JOIN
      if (appliedTodayEvent) {
        router.push(
          `/questions/${appliedTodayEvent._id}`
        );

        return;
      }

      // MULTIPLE EVENTS
      if (todayEvents.length > 0) {
        router.push('/questions');

        return;
      }

      // NO EVENTS
      router.push('/questions/no-event');
    } catch (error) {
      console.error(error);

      router.push('/questions');
    }
  };

  // SEND OTP
  const sendOTP = async (
    userPhoneOrEmail: string
  ) => {
    setIsSendingOTP(true);

    try {
      const response= await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_API_URL}/verify-otp`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          "mobile": userPhoneOrEmail,
          "type": "OTP"
        })
      })
      const data= await response.json();

      if (!data.success) {
        throw new Error(
          data.error ||
            'Failed to send OTP'
        );
      }

      setUserEmail(
        data.data?.email ||
          userPhoneOrEmail
      );

      if (data.data?.otpType) {
        setUserOtpType(data.data.otpType);
      }

      setResendCooldown(120);

      toast.success(
        data.message ||
          'OTP sent successfully'
      );

      if (
        process.env.NODE_ENV !==
          'production' &&
        data.otp
      ) {
        toast.info(
          `Development OTP: ${data.otp}`
        );
      }

      return true;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to send OTP'
      );

      return false;
    } finally {
      setIsSendingOTP(false);
    }
  };

  // STEP 1
  const onFormSubmit = async (
    values: LoginFormValues
  ) => {
    const sent = await sendOTP(
      values.userPhoneOrEmail
    );

    if (sent) {
      setCurrentStep(2);
    }
  };

  // STEP 2
  const onOTPSubmit = async (
    values: OTPFormValues
  ) => {
    if (!userEmail) return;

    setIsVerifyingOTP(true);

    try {
      // VERIFY OTP
      const response= await fetch(`${process.env.NEXT_PUBLIC_NOTIFICATION_API_URL}/verify-otp`,{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
        },
        body:JSON.stringify({
          "mobile": userEmail,
          "otp": values.otp
        })
      })
      const data= await response.json();

      if (!data.success) {
        throw new Error(
          data.error ||
            'OTP verification failed'
        );
      }

      toast.success(
        'OTP verified successfully!'
      );

      // FETCH USER
      const user =
        await getCurrentUser();

      // STORE USER
      dispatch(setUser(user));

      // REDIRECT
      await redirectToTodayEvent(user);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Login failed'
      );
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  // STEP INDICATOR
  const renderStepIndicator = () => (
    <div className="mb-6 flex justify-center">
      <div className="flex w-fit items-center justify-center gap-4 rounded-lg px-4 py-2">
        {[
          {
            number: 1,
            label: 'Enter Details',
          },
          {
            number: 2,
            label: 'Verify OTP',
          },
        ].map((step, index) => (
          <div
            key={step.number}
            className="flex items-center"
          >
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300
                ${
                  currentStep >= step.number
                    ? 'bg-[#1477e6] text-white scale-105 shadow-md'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {step.number}
              </div>

              <span
                className={`mt-1 text-[11px] whitespace-nowrap transition-all duration-300
                ${
                  currentStep >= step.number
                    ? 'font-medium text-[#1477e6]'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {index < 1 && (
              <div
                className={`mx-2 mb-5 h-[2px] w-12 transition-all duration-300
                ${
                  currentStep > step.number
                    ? 'bg-[#1477e6]'
                    : 'bg-slate-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // LOGIN FORM UI
  const renderEmailForm = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          onFormSubmit
        )}
        className="space-y-5"
      >
        <div className="mb-2 flex items-center gap-3">
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#245cf0] to-[#0f97cb] text-white">
            <Mail className="h-4 w-4" />
          </div>

          <h2 className="text-2xl font-bold text-[#0d83c0]">
            Login
          </h2>
        </div>

        <FormField
          control={form.control}
          name="userPhoneOrEmail"
          rules={{
            required:
              'Email or Phone is required',
            validate: (value) => {
              const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

              const phoneRegex =
                /^[0-9]{10}$/;

              if (
                !emailRegex.test(value) &&
                !phoneRegex.test(value)
              ) {
                return 'Please enter a valid email or 10-digit phone number';
              }

              return true;
            },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-semibold text-slate-700">
                Email ID or Phone Number{' '}
                <span className="text-red-500">
                  *
                </span>
              </FormLabel>

              <FormControl>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6aa8ff]" />

                  <Input
                    placeholder="Enter email or phone number"
                    className="h-12 rounded-2xl border-blue-200 bg-white pl-10 text-base placeholder:text-slate-400 focus-visible:ring-blue-400"
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
          disabled={isSendingOTP}
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#245cf0] to-[#0f97cb] text-lg font-semibold text-white hover:from-[#1748cc] hover:to-[#0d83ae]"
        >
          {isSendingOTP
            ? 'Sending OTP...'
            : 'Continue'}
        </Button>
      </form>
    </Form>
  );

  // OTP FORM UI
  const renderOTPForm = () => (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1477e6]/10">
          <Mail className="h-6 w-6 text-[#1477e6]" />
        </div>

        <h2 className="text-2xl font-bold text-[#0d83c0]">
          Verify OTP
        </h2>

        <p className="text-slate-500">
          Enter the 6-digit code sent to{' '}
          <strong className="text-slate-700">
            {userEmail}
          </strong>
        </p>
      </div>

      <Form {...otpForm}>
        <form
          onSubmit={otpForm.handleSubmit(
            onOTPSubmit
          )}
          className="space-y-4"
        >
          <FormField
            control={otpForm.control}
            name="otp"
            rules={{
              required: 'OTP is required',
              pattern: {
                value: /^[0-9]{6}$/,
                message:
                  'Please enter a valid 6-digit OTP',
              },
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700">
                  Verification Code
                </FormLabel>

                <FormControl>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="h-14 rounded-2xl border-blue-200 text-center text-2xl tracking-[0.5em] focus-visible:ring-blue-400"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentStep(1);

                setResendCooldown(0);

                otpForm.reset();
              }}
              className="h-12 flex-1 rounded-2xl border-blue-200 hover:bg-blue-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              type="submit"
              disabled={isVerifyingOTP}
              className="h-12 flex-1 rounded-2xl bg-gradient-to-r from-[#245cf0] to-[#0f97cb] text-white hover:from-[#1748cc] hover:to-[#0d83ae]"
            >
              {isVerifyingOTP
                ? 'Verifying...'
                : 'Login'}
            </Button>
          </div>
        </form>
      </Form>

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          onClick={() =>
            sendOTP(userEmail)
          }
          disabled={
            isSendingOTP ||
            resendCooldown > 0
          }
          className="text-sm text-[#1477e6] hover:text-[#0d83c0] disabled:text-slate-400"
        >
          {isSendingOTP
            ? 'Resending...'
            : resendCooldown > 0
            ? `Resend OTP in ${Math.floor(
                resendCooldown / 60
              )}:${String(
                resendCooldown % 60
              ).padStart(2, '0')}`
            : "Didn't receive the code? Resend"}
        </Button>
      </div>
    </div>
  );

  return (
    <ComponentWrapper>
      <div className="flex min-h-screen items-center justify-center bg-[#eef2f5] px-4">
        <Card className="-mt-24 w-full max-w-md rounded-2xl border border-blue-200 bg-white shadow-xl">
          <div className="space-y-6 px-4 py-6 sm:px-8 sm:py-6">
            <div className="space-y-2 text-center">
              <Image
                src="/logos/tech-saksham.png"
                alt="Tech Saksham"
                width={64}
                height={64}
                className="mx-auto h-16 w-16 rounded-full"
              />

              <p className="text-2xl font-semibold text-[#0d83c0]">
                Login to Tech Saksham Portal
              </p>
            </div>

            {renderStepIndicator()}

            {currentStep === 1 &&
              renderEmailForm()}

            {currentStep === 2 &&
              renderOTPForm()}

            <div className="space-y-3 border-t border-blue-100 pt-4 text-center text-sm text-slate-500">
              <p>
                <span className="inline-flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-[#4c84ff] md:h-5 md:w-5" />

                  <span className="font-medium text-gray-900">
                    Or scan your ID card QR
                    code to login
                  </span>
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </ComponentWrapper>
  );
}