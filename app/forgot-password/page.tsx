'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Mail, ArrowLeft, Key } from 'lucide-react';
import apiClient from '@/lib/api-client';
import ComponentWrapper from '@/components/ComponentWrapper';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const toast = useToast();
  const [isSending, setIsSending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [currentStep, setCurrentStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');

  const forgotPasswordForm = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const resetPasswordForm = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
    },
  });

  const onForgotPasswordSubmit = async (values: ForgotPasswordValues) => {
    setIsSending(true);
    try {
      const {data} = await apiClient.post('/api/forgot-password', {...values});

      if (!data.success) {
        throw new Error(data.error || 'Failed to send reset code');
      }

      setEmail(values.email);
      setCurrentStep('reset');
      toast.success(data.message);

      // In development, show the OTP
      if (process.env.NODE_ENV !== 'production' && data.otp) {
        toast.info(`Development OTP: ${data.otp}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send reset code');
    } finally {
      setIsSending(false);
    }
  };

  const onResetPasswordSubmit = async (values: ResetPasswordValues) => {
    setIsResetting(true);
    try {
      const {data} = await apiClient.post('/api/reset-password', {...values});

      if (!data.success) {
        throw new Error(data.error || 'Failed to reset password');
      }

      toast.success(data.message);

      // Redirect to login after successful reset
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'request' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
        >
          1
        </div>
        <div className="w-8 h-0.5 bg-muted" />
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep === 'reset' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
        >
          2
        </div>
      </div>
    </div>
  );

  return (
    <ComponentWrapper>
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">Forgot Password</h1>
            <Link href="/login">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </div>

          {renderStepIndicator()}

          <div className="text-center space-y-2 mb-6">
            <p className="text-muted-foreground">
              {currentStep === 'request' && "Enter your email address to receive a password reset code."}
              {currentStep === 'reset' && "Enter the code sent to your email and your new password."}
            </p>
          </div>

          {currentStep === 'request' && (
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? 'Sending...' : 'Send Reset Code'}
                  <Mail className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          )}

          {currentStep === 'reset' && (
            <Form {...resetPasswordForm}>
              <form onSubmit={resetPasswordForm.handleSubmit(onResetPasswordSubmit)} className="space-y-4">
                <FormField
                  control={resetPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setEmail(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetPasswordForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reset Code</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="text-center text-lg tracking-widest"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={resetPasswordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your new password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isResetting}
                  className="w-full"
                >
                  {isResetting ? 'Resetting...' : 'Reset Password'}
                  <Key className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </Form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Remember your password?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </Card>
    </div>
    </ComponentWrapper>
  );
}
