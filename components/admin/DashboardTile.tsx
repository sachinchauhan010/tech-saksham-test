'use client';

import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface DashboardTileProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor?: string;
  description?: string;
}

export default function DashboardTile({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  description,
}: DashboardTileProps) {
  return (
    <Card className="border-blue-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
          {description && (
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
    </Card>
  );
}
