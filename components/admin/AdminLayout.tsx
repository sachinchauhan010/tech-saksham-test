'use client';

import DashboardLayout from '@/components/admin/DashboardLayout';

type AdminLayoutProps = {
  children: React.ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardLayout>{children}</DashboardLayout>
  );
}
