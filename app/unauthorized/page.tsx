'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ShieldX, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ComponentWrapper from '@/components/ComponentWrapper';

export default function UnauthorizedPage() {
  return (
    <ComponentWrapper>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center space-y-6 shadow-lg">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <ShieldX className="w-8 h-8 text-red-600" />
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 leading-relaxed">
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/" className="block w-full">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors">
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
          </Link>
          
          {/* <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button> */}
        </div>

        {/* Help Text */}
        <div className="text-sm text-gray-500 border-t pt-4">
          <p>Need help? Contact your system administrator</p>
        </div>
      </Card>
    </div>
    </ComponentWrapper>
  );
}