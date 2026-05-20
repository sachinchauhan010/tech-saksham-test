'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Shield, LogOut, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector } from '@/redux/hooks';
import apiClient from '@/lib/api-client';

export default function AdminNav() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAppSelector((state) => state.user);
  
  useEffect(() => {
    try {
      
    } catch (error) {
      
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      // Use unified logout endpoint
      await apiClient.post('/api/logout', );
      toast.success('Admin logged out successfully');
      setIsAdmin(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (isLoading) {
    return null;
  }

  if (!isAdmin) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground mb-4">
          NICSI Saksham Administrator?
        </p>
        <Link href="/admin/login">
          <Button variant="outline">Admin Portal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-green-600">
        <Shield className="h-5 w-5" />
        <span className="font-medium">Admin Session Active</span>
      </div>

      <div className="flex gap-2 justify-center flex-wrap">
        <Link href="/admin/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Admin Dashboard
          </Button>
        </Link>

        <Link href="/admin/questions">
          <Button variant="outline" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Questions
          </Button>
        </Link>

        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Admin Logout
        </Button>
      </div>
    </div>
  );
}
