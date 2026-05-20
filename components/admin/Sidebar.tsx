'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { LayoutDashboard, LogOut, MessageSquare, Users, FileText, TrendingUp, User, Settings, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar as AppSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarSeparator,
  useSidebar,
} from '@/components/ui/sidebar';
import SidebarItem from '@/components/admin/SidebarItem';
import { useAppSelector } from '@/redux/hooks';
import { ROLE } from '@/lib/enum';
import apiClient from '@/lib/api-client';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: (pathname: string, tab: string | null) => boolean;
};

type ActiveNavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
};

// Navigation items for regular admin users
const adminNavItems: NavItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === '/admin/dashboard',
  },
  // {
  //   href: '/admin/register-participants',
  //   label: 'Register Participants',
  //   icon: User,
  //   isActive: (pathname) => pathname === '/admin/register-participants',
  // },
  {
    href: '/admin/users',
    label: 'Participants',
    icon: Users,
    isActive: (pathname) => pathname === '/admin/users',
  },
  {
    href: '/admin/id-cards',
    label: 'ID Cards',
    icon: FileText,
    isActive: (pathname) => pathname === '/admin/id-cards',
  },
  {
    href: '/admin/certificates',
    label: 'Certificates',
    icon: FileText,
    isActive: (pathname) => pathname === '/admin/certificates',
  },
  {
    href: '/admin/participants-q&a',
    label: 'Participants Questions',
    icon: TrendingUp,
    isActive: (pathname) => pathname === '/admin/participants-q&a',
  },
  {
    href: '/admin/questions',
    label: 'Manage Questions',
    icon: MessageSquare,
    isActive: (pathname) => pathname === '/admin/questions',
  },
  {
    href: '/admin/assigned-events',
    label: 'Assigned Events',
    icon: Shield,
    isActive: (pathname) => pathname === '/admin/assigned-events',
  },
];

// Additional navigation items for super admin users (includes all admin items)
const superAdminNavItems: NavItem[] = [
  // ...adminNavItems,
  {
    href: '/admin/super-dashboard',
    label: 'Super Dashboard',
    icon: LayoutDashboard,
    isActive: (pathname) => pathname === '/admin/super-dashboard',
  },
  {
    href: '/admin/admin-users',
    label: 'Participants',
    icon: Users,
    isActive: (pathname) => pathname === '/admin/admin-users',
  },
  {
    href: '/admin/manage-event',
    label: 'Manage Event',
    icon: Calendar,
    isActive: (pathname) => pathname === '/admin/manage-event',
  },
  {
    href: '/admin/manage-admin',
    label: 'Manage Admin',
    icon: Settings,
    isActive: (pathname) => pathname === '/admin/manage-admin',
  },
];

type SidebarContentProps = {
  onNavigate?: () => void;
};

function AdminSidebarContent({ onNavigate }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const {user} = useAppSelector((state) => state.user);

  // Determine navigation items based on user role
  const navItems = useMemo(() => {
    if (!user?.role) return adminNavItems;
    
    const userRoles = Array.isArray(user.role) ? user.role : [user.role];
    const isSuperAdmin = userRoles.includes(ROLE.SUPER_ADMIN);
    
    return isSuperAdmin ? superAdminNavItems : adminNavItems;
  }, [user]);

  const activeItems = useMemo(
    () =>
      navItems.map((item: NavItem): ActiveNavItem => ({
        ...item,
        isActive: item.isActive(pathname, null),
      })),
    [pathname, navItems],
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const {data} = await apiClient.post('/api/admin/logout', {});
      if(data.success){
        toast.success('Logged out successfully');
        router.push('/admin/login');
      }else{
        toast.error('Failed to logout');
      }
    } catch {
      toast.error('Failed to logout');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white max-w-7xl">
      <SidebarHeader className="px-4">
        <div className="mb-2 flex items-center gap-3">
          <Image src="/logos/tech-saksham.png" alt="Tech Saksham" width={48} height={48} className="h-12 w-12 rounded-full" />
          <div>
            <p className="text-base font-semibold text-[#19389c]">{user?.role?.includes(ROLE.SUPER_ADMIN) ? 'Super Admin' : 'Admin'}</p>
            <p className="text-sm text-slate-500">Tech Saksham</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-3">
          <SidebarGroupLabel className="px-0 text-sm font-medium uppercase tracking-wide text-slate-400">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <nav aria-label="Admin sidebar navigation">
              <SidebarMenu>
                {activeItems.map((item: ActiveNavItem) => (
                  <SidebarItem
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={item.isActive}
                    onNavigate={onNavigate}
                  />
                ))}
              </SidebarMenu>
            </nav>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* <SidebarFooter className="">
        <SidebarSeparator className="mb-3 bg-blue-100" />
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Logout from admin panel"
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </Button>
      </SidebarFooter> */}
    </div>
  );
}

export default function Sidebar() {
  const { setOpenMobile } = useSidebar();

  return (
    <AppSidebar
      collapsible="offcanvas"
      className="border border-blue-100 bg-white [&_[data-sidebar=sidebar]]:bg-white rounded"
    >
      <AdminSidebarContent onNavigate={() => setOpenMobile(false)} />
    </AppSidebar>
  );
}
