'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

type SidebarItemProps = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  onNavigate?: () => void;
};

export default function SidebarItem({
  href,
  label,
  icon: Icon,
  isActive = false,
  onNavigate,
}: SidebarItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={isActive}
        onClick={onNavigate}
        className={cn(
          'h-10 rounded-xl px-3 text-base transition-all',
          isActive
            ? 'bg-gradient-to-r from-[#2454d7] to-[#2c3fa8] text-white hover:text-white'
            : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700',
        )}
      >
        <Link href={href} aria-current={isActive ? 'page' : undefined}>
          <Icon
            className={cn(
              'h-5 w-5 shrink-0 transition-colors',
              isActive ? 'text-white' : 'text-slate-500',
            )}
          />
          <span className={cn(isActive ? 'text-white' : 'text-inherit')}>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
