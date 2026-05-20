'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Cell,
  TooltipProps,
} from 'recharts';
import { ChartNoAxesCombined } from 'lucide-react';
import EventFilterDropdown from '@/components/admin/EventFilterDropdown';
import { Question } from '@/types/question';
import { IEvent } from '@/types/interface';

interface SessionBucket {
  sessionName: string;
  count: number;
  fill: string;
}

interface Props {
  questions: Question[];
  assignedEvents: IEvent[];
}

// Distinct bar colors cycling for multiple sessions
const BAR_COLORS = [
  '#1d6fb8',
  '#1a8a5a',
  '#c0392b',
  '#7c3aed',
  '#d97706',
  '#0891b2',
  '#be185d',
  '#4f46e5',
];

/** Tokenize a string into lowercase words for keyword matching */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/** Score how well a question text matches a session via keyword overlap */
function keywordScore(questionText: string, session: any): number {
  const qTokens = new Set(tokenize(questionText));
  const sessionText = [
    session.title ?? '',
    session.name ?? '',
    session.description ?? '',
    ...(session.tags ?? []),
    ...(session.keywords ?? []),
  ].join(' ');
  const sTokens = tokenize(sessionText);
  let score = 0;
  for (const t of sTokens) {
    if (qTokens.has(t)) score++;
  }
  return score;
}

export default function QuestionsBySessionChart({ questions, assignedEvents }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  const chartData = useMemo<SessionBucket[]>(() => {
    // 1. Determine which events are in scope
    const eventsInScope: IEvent[] = selectedEvent
      ? [selectedEvent]
      : assignedEvents;

    if (eventsInScope.length === 0 || questions.length === 0) return [];

    // 2. Collect all sessions across scoped events, tagging which event they belong to
    type Session = any & { _eventId: string };
    const allSessions: Session[] = [];

    eventsInScope.forEach((event: any) => {
      const sessions: any[] = event.sessions ?? event.agenda ?? [];
      sessions.forEach((s: any) => {
        allSessions.push({ ...s, _eventId: String(event._id) });
      });
    });

    // 3. Build buckets: one per session + one "Generic" fallback
    const buckets: Map<string, number> = new Map();
    allSessions.forEach((s) => {
      const label = s.title ?? s.name ?? `Session ${s._id ?? ''}`;
      buckets.set(label, 0);
    });
    buckets.set('Generic', 0);

    // 4. Filter questions to scoped event IDs
    const scopedEventIds = new Set(eventsInScope.map((e) => String((e as any)._id)));
    const scopedQuestions = questions.filter((q) =>
      scopedEventIds.has(String(q.eventId))
    );

    // 5. Map each question → best session
    scopedQuestions.forEach((question: any) => {
      const createdAt = question.createdAt ? new Date(question.createdAt) : null;

      // --- Step A: Time match ---
      if (createdAt && allSessions.length > 0) {
        const timeMatch = allSessions.find((s) => {
          if (!s.startTime || !s.endTime) return false;
          const start = new Date(s.startTime);
          const end = new Date(s.endTime);
          return createdAt >= start && createdAt <= end;
        });
        if (timeMatch) {
          const label = timeMatch.title ?? timeMatch.name ?? `Session ${timeMatch._id ?? ''}`;
          buckets.set(label, (buckets.get(label) ?? 0) + 1);
          return;
        }
      }

      // --- Step B: Keyword match (best score wins) ---
      if (allSessions.length > 0 && question.text) {
        let bestSession: Session | null = null;
        let bestScore = 0;
        allSessions.forEach((s) => {
          const score = keywordScore(question.text, s);
          if (score > bestScore) {
            bestScore = score;
            bestSession = s;
          }
        });
        if (bestSession && bestScore > 0) {
          const label =
            (bestSession as Session).title ??
            (bestSession as Session).name ??
            `Session ${(bestSession as Session)._id ?? ''}`;
          buckets.set(label, (buckets.get(label) ?? 0) + 1);
          return;
        }
      }

      // --- Step C: Generic fallback ---
      // If there are no sessions defined at all, label by event name instead
      if (allSessions.length === 0) {
        const evt = eventsInScope.find((e) => String((e as any)._id) === String(question.eventId));
        const label = (evt as any)?.title ?? (evt as any)?.name ?? 'Generic';
        buckets.set(label, (buckets.get(label) ?? 0) + 1);
      } else {
        buckets.set('Generic', (buckets.get('Generic') ?? 0) + 1);
      }
    });

    // 6. Convert to array, drop empty Generic if unused
    const result: SessionBucket[] = [];
    let colorIndex = 0;
    buckets.forEach((count, sessionName) => {
      if (sessionName === 'Generic' && count === 0) return;
      result.push({
        sessionName,
        count,
        fill: BAR_COLORS[colorIndex % BAR_COLORS.length],
      });
      colorIndex++;
    });

    return result;
  }, [questions, assignedEvents, selectedEvent]);

  const totalQuestions = chartData.reduce((s, d) => s + d.count, 0);

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const count = payload[0]?.value ?? 0;
      const pct = totalQuestions > 0 ? ((Number(count) / totalQuestions) * 100).toFixed(1) : '0';
      return (
        <div className="bg-white border border-slate-200 shadow-xl rounded-xl p-4 min-w-[200px]">
          <p className="text-sm font-semibold text-slate-900 mb-2">{label}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-600">Questions</span>
            <span className="text-sm font-bold text-blue-600">{count}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-600">Share</span>
            <span className="text-sm font-bold text-slate-500">{pct}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const chartConfig = Object.fromEntries(
    chartData.map((d) => [d.sessionName, { label: d.sessionName, color: d.fill }])
  );

  return (
    <Card className="border-blue-200 p-4">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ChartNoAxesCombined className="h-5 w-5 text-blue-700 shrink-0" />
            <h2 className="text-xl font-bold text-slate-800">Questions by Session</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Distribution of questions across sessions
          </p>
        </div>

        {/* Summary Stats */}
        <div className="flex items-center gap-8">
          <div>
            <p className="text-3xl font-bold text-blue-600">
              {totalQuestions}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Questions</p>
          </div>
          <div className="border-l-2 border-slate-100 pl-8">
            <p className="text-3xl font-bold text-green-600">
              {chartData.filter((d) => d.sessionName !== 'Generic').length}
            </p>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Total Sessions</p>
          </div>
        </div>

        <EventFilterDropdown
          assignEvents={assignedEvents}
          selectedEvent={selectedEvent}
          onSelectEvent={setSelectedEvent}
          allEventsLabel="All Assigned Events"
        />
      </div>

      {/* Empty state */}
      {chartData.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            No session data available for the selected event.
          </p>
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 16, left: 0, bottom: 40 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="sessionName"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={70}
              tickFormatter={(v: string) => (v.length > 20 ? `${v.slice(0, 18)}…` : v)}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              allowDecimals={false}
              width={28}
            />
            <ChartTooltip cursor={{ fill: '#f1f5f9' }} content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </Card>
  );
}