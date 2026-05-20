'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { ROLE } from '@/lib/enum';
import DashboardLayout from '@/components/admin/DashboardLayout';

export default function AdminRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const isAdminLoginRoute = pathname === '/admin/login';

  // Fetch authentication details from Redux store
  const { user, isAuthenticated, loading } = useSelector((state: RootState) => state.user);

  console.log('user', user);
  console.log('isAuthenticated', isAuthenticated);
  console.log('loading', loading);

  useEffect(() => {
    if (isAdminLoginRoute) {
      setIsCheckingAuth(false);
      return;
    }

    // Wait for loading to complete before checking authentication
    if (loading) {
      return;
    }
    const checkAdminAccess = () => {

      // Handle both string and array roles
      const userRoles = user?.role || [];
      const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
      const hasAdminRole = rolesArray.includes(ROLE.ADMIN) || rolesArray.includes(ROLE.SUPER_ADMIN);

      setIsCheckingAuth(false);
    };

    checkAdminAccess();
  }, [isAdminLoginRoute, router, user, isAuthenticated, loading]);

  if (isAdminLoginRoute) {
    return <>{children}</>;
  }

  if (isCheckingAuth || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
