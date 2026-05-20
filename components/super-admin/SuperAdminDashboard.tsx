'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  Users,
  Shield,
  MessageSquare,
} from 'lucide-react';
import apiClient from '@/lib/api-client';
import EventEngagementChart from '@/components/admin/EventEngagementChart';
import EventCategoryDistribution from '@/components/admin/EventCategoryDistribution';
import DashboardTile from '@/components/admin/DashboardTile';
import QuestionStatusChart from '@/components/admin/QuestionStatusChart';
import QuestionsBySessionChart from '@/components/admin/QuestionsBySessionChart';
import EventFilterDropdown from '@/components/admin/EventFilterDropdown';

import { Question } from '@/types/question';
import { IEvent, IUser } from '@/types/interface';

function SuperAdminDashboardContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [allEvents, setAllEvents] = useState<IEvent[]>([]);
  const [users, setUsers] = useState<IUser[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<IEvent | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Events
      let events: IEvent[] = [];
      const eventRes = await apiClient.get('/api/admin/manage-event');
      if (eventRes.data?.success) {
        events = eventRes.data.data || [];
        setAllEvents(events);
      }

      // 2. Fetch Questions
      const questionsRes = await apiClient.get('/api/delegate/questions');
      if (questionsRes.data?.success) {
        setQuestions(questionsRes.data.data || []);
      }

      // 3. Fetch Admins
      const adminRes = await apiClient.get('/api/admin/manage-admin');
      if (adminRes.data?.success) {
        setAdmins(adminRes.data.data || []);
      }

      // 4. Fetch All Users based on Events
      if (events.length > 0) {
        const usersRes = await apiClient.post('/api/admin/users', {
          managedEvents: events.map((e: any) => ({ eventCode: e.eventCode })),
        });
        if (usersRes.data?.success) {
          setUsers(usersRes.data.data || []);
        }
      }
    } catch (error) {
      console.error('Error fetching super admin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Tile metrics ---
  const tileEventsCount = allEvents.length;
  const tileAdminsCount = admins.length;
  
  const tileQuestions = useMemo(() => {
    if (!selectedEvent) return questions;
    return questions.filter((q) => String(q.eventId) === String((selectedEvent as any)._id));
  }, [questions, selectedEvent]);

  const tileUsersCount = useMemo(() => {
    if (!selectedEvent) return users.length;
    return users.filter((u: any) =>
      u.eventApplied?.some((applied: any) => applied.eventCode === selectedEvent.eventCode)
    ).length;
  }, [users, selectedEvent]);

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="space-y-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0f5fc3]">Super Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Platform-wide analytics and overall engagement</p>
        </div>

        {/* Event selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold text-slate-800">Platform Overview</h2>
          <EventFilterDropdown
            assignEvents={allEvents}
            selectedEvent={selectedEvent}
            onSelectEvent={setSelectedEvent}
            allEventsLabel="All Events"
          />
        </div>

        {/* Tiles */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <DashboardTile title="Total Events"       value={tileEventsCount}          icon={Calendar} />
          <DashboardTile title="Total Admins"       value={tileAdminsCount}          icon={Shield} />
          <DashboardTile title="Total Participants" value={tileUsersCount}           icon={Users} />
          <DashboardTile title="Total Questions"    value={tileQuestions.length}     icon={MessageSquare} />
        </div>

        {/* Charts */}
        <EventEngagementChart
          assignedEvents={allEvents}
          users={users}
          questions={questions}
        />

        <EventCategoryDistribution assignedEvents={allEvents} />

        <QuestionStatusChart questions={questions} assignedEvents={allEvents} />

        <QuestionsBySessionChart
          questions={questions}
          assignedEvents={allEvents}
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

export default function SuperAdminDashboard() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    }>
      <SuperAdminDashboardContent />
    </Suspense>
  );
}