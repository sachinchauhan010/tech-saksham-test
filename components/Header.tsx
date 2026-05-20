'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FileText, Home, HomeIcon, LogIn, LogOut, Menu, MessageSquare, Shield, User, Users, X } from 'lucide-react';
import { toast } from 'sonner';
import { useAppSelector, useAppDispatch } from '@/redux/hooks';
import { ROLE } from '@/lib/enum';
import { clearUser } from '@/redux/slices/authSlice';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const { user, isAuthenticated } = useAppSelector((state) => state.user);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const {data} = await apiClient.post('/api/logout', {});
      if (data.success) {
        toast.success('Logged out successfully');
        dispatch(clearUser());
        setUserRole('');
        router.push('/');
      }
    } catch (error) {
      console.error('Logout failed', error);
      toast.error('Failed to logout');
    }
  };

  useEffect(() => {
    if (user?.role) {
      setUserRole(user.role);
    }
  }, [user]);

  // const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  const navLinks = useMemo<NavItem[]>(() => {

    if ((userRole===ROLE.ADMIN)) {
      return [
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/admin/dashboard', label: 'Dashboard', icon: Shield },
        { href: '/live-questions', label: 'Live Questions', icon: MessageSquare },
      ];
    }

    if(userRole===ROLE.SUPER_ADMIN){
      return [
        { href: '/', label: 'Home', icon: HomeIcon },
        { href: '/admin/super-dashboard', label: 'Super Admin Dashboard', icon: Shield },
        { href: '/live-questions', label: 'Live Questions', icon: MessageSquare },
      ];
    }

    if (userRole===ROLE.USER || userRole===ROLE.GUEST || userRole===ROLE.ORGANIZER) {
      return [
        { href: '/questions', label: 'Ask Questions', icon: MessageSquare },
        { href: '/delegate-id-card', label: 'ID Card', icon: FileText },
        { href: '/delegate-certificate', label: 'Certificate', icon: FileText },
        { href: '/event', label: 'Event', icon: MessageSquare },
      ];
    }

    return [
      { href: '/', label: 'Home', icon: Home },
      { href: '/questions', label: 'Ask Questions', icon: MessageSquare },
      { href: '/live-questions', label: 'Live Questions', icon: MessageSquare },
    ];
  }, [userRole, isAuthenticated]);

  const renderAuthButtons = (mobile = false) => {
    const commonBtnClass = mobile
      ? 'w-full justify-center py-5 text-sm'
      : 'h-10 rounded-xl px-4 text-sm font-medium';

    if (isAuthenticated) {
      return (
        <>
          <div
            className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium ${userRole?.includes(ROLE.ADMIN) ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-blue-200 bg-blue-50 text-blue-700'
              }`}
          >
            {userRole=== ROLE.ADMIN || userRole=== ROLE.SUPER_ADMIN ? <Shield className="h-4 w-4" /> : <User className="h-4 w-4" />}
            <span>{ userRole=== ROLE.SUPER_ADMIN ? `Super Admin: ${user?.name || 'Super Admin'}` : userRole=== ROLE.ADMIN ? `Admin: ${user?.name || 'Admin'}` : user?.name || 'User'}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              handleLogout();
              if (mobile) setIsMobileMenuOpen(false);
            }}
            className={`${commonBtnClass} border-red-200 text-red-600 hover:border-red-300 hover:bg-red-500 hover:text-white`}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </>
      );
    }

    return (
      <>
        <Link
          href="/login"
          onClick={() => mobile && setIsMobileMenuOpen(false)}
          className={`${commonBtnClass} inline-flex items-center rounded-xl border border-blue-400 bg-blue-600 px-4 text-white transition hover:bg-blue-700`}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Login
        </Link>
        {/* <Link
          href="/register"
          className={`${commonBtnClass} inline-flex items-center rounded-xl border border-emerald-400 bg-emerald-600 px-4 text-white transition hover:bg-emerald-700`}
        >
          <Users className="mr-2 h-4 w-4" />
          Register
        </Link> */}
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 mb-4 border-b border-blue-100 bg-white/95 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-white/85">
      {/* <div className="h-1.5 bg-gradient-to-r from-[#ff9933] via-white to-[#138808]" /> */}

      <div className="border-b border-blue-100 bg-gradient-to-r from-[#2454d7] to-[#2c3fa8] text-white">
        <div className="mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex flex-col justify-between sm:flex-row sm:items-center sm:h-16 h-auto py-2 gap-2">
            {/* First row - 2 logos */}
            <div className="flex justify-between items-center sm:hidden">
              <Image src="/logos/Meity-w.svg" alt="MeitY" width={88} height={32} className="h-7 w-auto" />
              {/* <Image src="/logos/J&K-logo-white.svg" alt="J&K logo" width={106} height={32} className="h-7 w-auto" /> */}
            </div>
            {/* Second row - 3 logos */}
            <div className="flex justify-between items-center sm:hidden">
              <Image src="/logos/NICSI-Logo-w.svg" alt="NICSI" width={106} height={32} className="h-7 w-auto" />
              <Image src="/logos/nic-logo-white.png" alt="NIC" width={88} height={32} className="h-7 w-auto" />
              <Image src="/logos/digital India-White.svg" alt="Digital India" width={88} height={32} className="h-7 w-auto" />
            </div>
            {/* Desktop layout - single row */}
            <div className="hidden max-w-7xl mx-auto sm:flex sm:justify-between sm:w-full sm:items-center">
              <Image src="/logos/Meity-w.svg" alt="MeitY" width={88} height={32} className="h-7 w-auto sm:h-8" />
              {/* <Image src="/logos/J&K-logo-white.svg" alt="J&K logo" width={106} height={32} className="h-7 w-auto sm:h-10" /> */}
              <Image src="/logos/NICSI-Logo-w.svg" alt="NICSI" width={106} height={32} className="h-7 w-auto sm:h-10" />
              <Image src="/logos/nic-logo-white.png" alt="NIC" width={88} height={32} className="h-7 w-auto sm:h-8" />
              <Image src="/logos/digital India-White.svg" alt="Digital India" width={88} height={32} className="h-7 w-auto sm:h-8" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-7xl w-full">
          <div className="flex h-14 items-center justify-between sm:h-18">
            <Link href="/" className="inline-flex items-center gap-1">
              <Image src="/logos/tech-saksham.png" alt="Tech Saksham" width={42} height={42} className="h-12 w-12 rounded-full" />
              <div className="block">
                <p className="text-xl lg:text-2xl font-bold leading-none text-[#19389c]">Tech Saksham</p>
                {/* <p className="text-xs font-medium text-slate-500">Jammu & Kashmir</p> */}
              </div>
            </Link>

            {navLinks.length > 0 && (
              <nav className="hidden lg:flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50/70 px-2 py-1.5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white hover:text-blue-700"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}

            <div className="hidden lg:flex items-center gap-2">{renderAuthButtons()}</div>

            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden h-10 w-10 rounded-xl"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-blue-100 bg-white lg:hidden">
            <div className="mx-auto max-w-7xl space-y-3 px-4 py-4 sm:px-6">
              <nav className="space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                  >
                    <link.icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="space-y-2 border-t border-blue-100 pt-3">{renderAuthButtons(true)}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
