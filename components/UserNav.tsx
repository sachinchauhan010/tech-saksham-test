'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, LogOut, Shield } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export default function UserNav() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();

    // Add storage event listener to detect login/logout from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_session' || e.key === 'user_info') {
        checkAuthStatus();
      }
    };

    // Add window focus listener to re-check auth when window gains focus
    const handleFocus = () => {
      checkAuthStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check user status and role (unified authentication)
      const { data } = await apiClient.get('/api/auth/user-info');
      if (data.success) {
        setIsUser(true);
        setUserInfo(data.user);

        // Check if user is admin based on role from database
        const isAdminUser = data.user.role.includes('admin');
        setIsAdmin(isAdminUser);
      } else {
        setIsUser(false);
        setIsAdmin(false);
      }
    } catch (error) {
      setIsAdmin(false);
      setIsUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Use single logout endpoint for both admin and regular users
      const { data } = await apiClient.post('/api/logout', {});
      if (data.success) {
        toast.success('Admin logged out successfully');
      } else if (isUser) {
        toast.success('User logged out successfully');
      }

      // Reset states
      setIsAdmin(false);
      setIsUser(false);
      setUserInfo(null);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (isLoading) {
    return null;
  }

  // If admin is logged in, show admin navigation
  if (isAdmin) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-green-600">
          <Shield className="h-5 w-5" />
          <span className="font-medium">Admin Session Active</span>
        </div>

        <div className="flex gap-2 justify-center">
          <Link href="/admin/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Admin Dashboard
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

  // If regular user is logged in, show user navigation
  if (isUser && userInfo) {
    return (
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-blue-600">
          <User className="h-5 w-5" />
          <span className="font-medium">Welcome back, {userInfo.name}!</span>
        </div>

        <div className="flex gap-2 justify-center">
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              My Dashboard
            </Button>
          </Link>

          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // If no one is logged in, show login options
  return (
    <div className="text-center space-y-4">
      <p className="text-muted-foreground">
        Ready to get started?
      </p>

      <div className="flex gap-2 justify-center">
        <Link href="/register">
          <Button variant="default">Register</Button>
        </Link>

        <Link href="/login">
          <Button variant="outline">Login</Button>
        </Link>
      </div>

      <div className="pt-4 border-t">
        <p className="text-muted-foreground mb-2 text-sm">
          NICSI Saksham Administrator?
        </p>
        <Link href="/admin/login">
          <Button variant="outline" size="sm">Admin Portal</Button>
        </Link>
      </div>
    </div>
  );
}
