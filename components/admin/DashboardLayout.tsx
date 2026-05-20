'use client';

import Sidebar from './Sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider
      open
      onOpenChange={() => {}}
      className="min-h-svh bg-slate-50"
    >
      {/* Main Wrapper */}
      <div className="mx-auto flex w-full max-w-8xl">
        
        {/* Sidebar */}
        <Sidebar />

        {/* Content */}
        <SidebarInset className="min-h-svh flex-1 bg-slate-50">
          
          {/* Mobile Header */}
          <div className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:hidden">
            <SidebarTrigger aria-label="Toggle admin sidebar" />

            <div>
              <p className="text-sm font-semibold text-[#19389c]">
                Admin Dashboard
              </p>
            </div>
          </div>

          {/* Page Content */}
          <div className="w-full px-4 py-4 lg:px-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}