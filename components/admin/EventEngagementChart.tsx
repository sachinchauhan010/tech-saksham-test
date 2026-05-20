'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
} from '@/components/ui/chart';
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { IEvent, IUser } from '@/types/interface';
import { Question } from '@/types/question';
import { useState } from 'react';
import EventFilterDropdown from '@/components/admin/EventFilterDropdown';

interface EventEngagementData {
  eventName: string;
  registrations: number;
  questions: number;
  eventCode: string;
}

interface Props {
  assignedEvents: IEvent[];
  users: IUser[];
  questions: Question[];
}

export default function EventEngagementChart({ assignedEvents, users, questions }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const data = useMemo<EventEngagementData[]>(() => {
    const eventsToShow = !selectedEvent
      ? assignedEvents
      : assignedEvents.filter((e) => String(e._id) === String(selectedEvent._id));

    return eventsToShow.map((event: any) => {
      const appliedUsers = users.filter((user: any) =>
        user.eventApplied?.some((applied: any) => applied.eventCode === event.eventCode)
      );

      const eventQuestions = questions.filter(
        (question: any) => String(question.eventId) === String(event._id)
      );

      return {
        eventName: event.title || event.eventName || event.name || event.eventCode,
        eventCode: event.eventCode,
        registrations: appliedUsers.length,
        questions: eventQuestions.length,
      };
    });
  }, [assignedEvents, users, questions, selectedEvent]);

  const chartConfig = {
    registrations: {
      label: 'Registrations',
      color: 'hsl(221.2, 83.2%, 53.3%)',
    },
    questions: {
      label: 'Questions',
      color: 'hsl(142.1, 76.2%, 36.3%)',
    },
  };

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const registrations = payload.find((p: any) => p.dataKey === 'registrations')?.value || 0;
      const questions = payload.find((p: any) => p.dataKey === 'questions')?.value || 0;
      return (
        <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 min-w-[220px]">
          <p className="text-sm font-semibold text-slate-900 mb-3">{label}</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Registrations</span>
              <span className="text-sm font-bold text-blue-600">{registrations}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Questions</span>
              <span className="text-sm font-bold text-green-600">{questions}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-blue-200 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-blue-700" />
            <h2 className="text-xl font-bold text-slate-800">Event Engagement Analytics</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Registrations and questions for {!selectedEvent ? 'all events' : 'selected event'}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {data.reduce((sum, item) => sum + item.registrations, 0)}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Registrations</p>
          </div>
          <div className="border-l-2 border-slate-100 pl-8">
            <p className="text-3xl font-bold text-green-600">
              {data.reduce((sum, item) => sum + item.questions, 0)}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Questions</p>
          </div>
        </div>

        <EventFilterDropdown
          assignEvents={assignedEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          allEventsLabel="All Events"
        />
      </div>

      {/* Empty State */}
      {data.length === 0 ? (
        <div className="h-[320px] flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No event data available</p>
          </div>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[420px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            >
              <defs>
                <linearGradient id="colorRegistrations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(221.2, 83.2%, 53.3%)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="colorQuestions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142.1, 76.2%, 36.3%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(142.1, 76.2%, 36.3%)" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />

              <XAxis
                dataKey="eventName"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-40}
                textAnchor="end"
                height={100}
                padding={{ left: 20, right: 20 }}
                tickFormatter={(value) =>
                  value.length > 18 ? `${value.substring(0, 18)}...` : value
                }
              />

              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />

              <ChartTooltip
                cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                content={<CustomTooltip />}
              />

              <Area
                type="monotone"
                dataKey="registrations"
                name="Registrations"
                stroke="hsl(221.2, 83.2%, 53.3%)"
                strokeWidth={3}
                fill="url(#colorRegistrations)"
                fillOpacity={0.8}
              />
              <Area
                type="monotone"
                dataKey="questions"
                name="Questions"
                stroke="hsl(142.1, 76.2%, 36.3%)"
                strokeWidth={3}
                fill="url(#colorQuestions)"
                fillOpacity={0.8}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </Card>
  );
}