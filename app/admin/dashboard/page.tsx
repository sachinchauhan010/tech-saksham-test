'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  MessageSquare,
  Users,
  PieChart,
  TrendingUp,
  Users2,
} from 'lucide-react';
import {
  Cell,
  Pie,
  PieChart as RechartsPieChart,
} from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import apiClient from '@/lib/api-client';
import EventEngagementChart from '@/components/admin/EventEngagementChart';
import EventCategoryDistribution from '@/components/admin/EventCategoryDistribution';
import DashboardTile from '@/components/admin/DashboardTile';
import QuestionStatusChart from '@/components/admin/QuestionStatusChart';
import QuestionsBySessionChart from '@/components/admin/QuestionsBySessionChart';
import EventFilterDropdown from '@/components/admin/EventFilterDropdown';
import { useAppSelector } from '@/redux/hooks';

import { Question } from '@/types/question';
import { IEvent, IUser } from '@/types/interface';

function AdminDashboardContent() {
  const { user } = useAppSelector((state) => state.user);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [assignedEvents, setAssignedEvents] = useState<IEvent[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchQuestions(),
        fetchAssignedEvents(),
        fetchUsers(),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const { data } = await apiClient.get('/api/delegate/questions');
      if (data.success) setQuestions(data.data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const fetchAssignedEvents = async () => {
    try {
      const { data } = await apiClient.get('/api/admin/assigned-event');
      if (data.success) {
        setAssignedEvents(data.events || []);
      } else {
        console.error('Failed to fetch assigned events:', data.message);
      }
    } catch (error) {
      console.error('Error fetching assigned events:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.post('/api/admin/users', {
        managedEvents: user?.managedEvents || [],
      });
      if (data.success) {
        setUsers(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  };

  // --- Tile metrics ---
  const tileQuestions = useMemo(() => {
    if (!selectedEvent) {
      const assignedEventIds = assignedEvents.map((e) => String((e as any)._id));
      return questions.filter((q) => assignedEventIds.includes(String(q.eventId)));
    }
    return questions.filter((q) => String(q.eventId) === String((selectedEvent as any)._id));
  }, [questions, selectedEvent, assignedEvents]);

  const engagedParticipantsCount = useMemo(() => {
    const uniqueUsers = new Set(tileQuestions.map((q) => q.userId).filter(Boolean));
    return uniqueUsers.size;
  }, [tileQuestions]);

  const tileTotalUpvotes = useMemo(
    () => tileQuestions.reduce((sum, q) => sum + q.upVotes, 0),
    [tileQuestions],
  );

  const tileTotalRegistered = useMemo(() => {
    if (!selectedEvent) {
      const assignedEventCodes = assignedEvents.map((e) => e.eventCode);
      return users.filter((u: any) =>
        u.eventApplied?.some((applied: any) => assignedEventCodes.includes(applied.eventCode))
      ).length;
    }
    return users.filter((u: any) =>
      u.eventApplied?.some((applied: any) => applied.eventCode === selectedEvent.eventCode)
    ).length;
  }, [users, assignedEvents, selectedEvent]);

  // --- Pie chart: question status distribution ---
  const statusData = useMemo(
    () => [
      { name: 'Top Asked (5+)', value: questions.filter((q) => q.upVotes >= 5).length, fill: '#3b82f6' },
      { name: 'Emerging (<5)',  value: questions.filter((q) => q.upVotes < 5).length,  fill: '#10b981' },
    ],
    [questions],
  );

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="space-y-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f5fc3]">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Workshop analytics and live Questions flow</p>
        </div>

        {/* Event selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800">Engagement Overview</h2>
          <EventFilterDropdown
            assignEvents={assignedEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            allEventsLabel="All Assigned Events"
          />
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <DashboardTile title="Total Registered"     value={tileTotalRegistered}      icon={Users2} />
          <DashboardTile title="Engaged Participants" value={engagedParticipantsCount} icon={Users} />
          <DashboardTile title="Questions Engagement" value={tileQuestions.length}     icon={MessageSquare} />
          <DashboardTile title="Total Upvotes"        value={tileTotalUpvotes}         icon={TrendingUp} />
        </div>

        {/* Children — receive data as props, no internal API calls */}
        <EventEngagementChart
          assignedEvents={assignedEvents}
          users={users}
          questions={questions}
        />

        <EventCategoryDistribution assignedEvents={assignedEvents} />

        <QuestionStatusChart questions={questions} assignedEvents={assignedEvents} />

        <QuestionsBySessionChart
          questions={questions}
          assignedEvents={assignedEvents}
        />

        {isLoading && (
          <Card className="mt-6 p-4">
            <p className="text-sm text-muted-foreground">Loading dashboard metrics...</p>
          </Card>
        )}
      </div>
    </section>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}