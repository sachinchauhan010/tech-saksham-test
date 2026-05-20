'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import {
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { PieChart as PieChartIcon, Calendar } from 'lucide-react';
import { IEvent } from '@/types/interface';
import { EVENT_CATEGORY } from '@/lib/enum';

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

interface Props {
  assignedEvents: IEvent[];
}

const CATEGORY_COLORS = {
  [EVENT_CATEGORY.CONFERENCE]: 'hsl(221.2, 83.2%, 53.3%)',
  [EVENT_CATEGORY.WORKSHOP]: 'hsl(142.1, 76.2%, 36.3%)',
  [EVENT_CATEGORY.SEMINAR]: 'hsl(38, 92%, 50%)',
  [EVENT_CATEGORY.SOCIAL]: 'hsl(0, 84%, 60%)',
};

const CATEGORY_LABELS = {
  [EVENT_CATEGORY.CONFERENCE]: 'Conference',
  [EVENT_CATEGORY.WORKSHOP]: 'Workshop',
  [EVENT_CATEGORY.SEMINAR]: 'Seminar',
  [EVENT_CATEGORY.SOCIAL]: 'Social',
};

export default function EventCategoryDistribution({ assignedEvents }: Props) {

  const data = useMemo<CategoryData[]>(() => {
    const categoryCount: { [key: string]: number } = {};

    assignedEvents.forEach((event: any) => {
      const category = event.category || 'uncategorized';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, value]) => ({
      name: CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS] ||
        category.charAt(0).toUpperCase() + category.slice(1),
      value,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] ||
        'hsl(220, 14%, 96%)',
    }));
  }, [assignedEvents]);

  const chartConfig = { events: { label: 'Events' } };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 shadow-xl rounded-lg p-3">
          <p className="text-sm font-semibold text-slate-900">{payload[0].name}</p>
          <p className="text-sm text-slate-600">
            {payload[0].value} event{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.05) return null;
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="border-green-200 p-6">
      {/* Header */}
      <div className='flex justify-between items-center w-full'>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <PieChartIcon className="h-4 w-4 text-green-700" />
            <h2 className="text-xl font-semibold text-slate-800">Event Category Distribution</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Distribution of assigned events by category
          </p>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-green-600">
              {data.length}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Categories</p>
          </div>
          <div className="border-l-2 border-slate-100 pl-8">
            <p className="text-3xl font-bold text-blue-600">
              {assignedEvents.length}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Events</p>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="h-[300px] w-full flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No event categories available</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <ChartContainer config={chartConfig} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value: string, entry: any) => (
                    <span style={{ color: entry.color }}>
                      {value} ({entry.payload.value})
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      )}
    </Card>
  );
}