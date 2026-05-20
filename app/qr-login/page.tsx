'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle, XCircle, Smartphone } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAppDispatch } from '@/redux/hooks';
import { setUser } from '@/redux/slices/authSlice';
import { getCurrentUser } from '@/services/authService';
import ComponentWrapper from '@/components/ComponentWrapper';

function QRLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying QR code...');
  const dispatch = useAppDispatch();


  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('No QR code token found');
      return;
    }

    const verifyToken = async () => {
      try {
        const { data } = await apiClient.get(`/api/qr-login?token=${token}`);

        if (data.success) {
          setStatus('success');
          setMessage('Login successful! Redirecting...');
          const user = await getCurrentUser();
          dispatch(setUser(user));

          // Redirect to questions page after a short delay
          setTimeout(() => {
            router.push('/questions');
          }, 1500);
        } else {
          setStatus('error');
          setMessage(data.error || 'Failed to verify QR code');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyToken();
  }, [searchParams, router]);

  return (
    <ComponentWrapper>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-800">
              QR Code Login
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-6">
            <div className="relative">
              <Smartphone className="w-16 h-16 text-blue-600" />
              {status === 'loading' && (
                <div className="absolute -top-2 -right-2">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="absolute -top-2 -right-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="absolute -top-2 -right-2">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              )}
            </div>

            <div className="text-center">
              <p className={`text-lg font-medium ${status === 'success' ? 'text-green-600' :
                status === 'error' ? 'text-red-600' :
                  'text-gray-600'
                }`}>
                {message}
              </p>
            </div>

            {status === 'error' && (
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </button>
            )}
          </CardContent>
        </Card>
      </div>

    </ComponentWrapper>
  );
}

export default function QRLoginPage() {
  return (
    <ComponentWrapper>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </CardContent>
          </Card>
        </div>
      }>
        <QRLoginPageContent />
      </Suspense>
    </ComponentWrapper>
  );
}
