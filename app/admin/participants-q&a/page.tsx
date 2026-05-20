'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Question } from '@/types/question';
import AdminLiveQuestions from '@/components/admin/AdminLiveQuestions';
import apiClient from '@/lib/api-client';

export default function LiveQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchQuestions = async (showLoader = true) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const response = await apiClient.get('/api/delegate/questions');
      const data = response.data;

      if (data.success) {
        setQuestions(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch {
      toast.error('Failed to load live Questions');
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void fetchQuestions(true);

    // Keep page synced with latest upvotes/answers.
    const interval = window.setInterval(() => {
      void fetchQuestions(false);
    }, 5000);

    // Listen for question status changes from admin page and upvote changes from user page
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'question_status_changed') {
        try {
          const changeData = JSON.parse(e.newValue || '{}');
          if (changeData.questionId && changeData.status) {
            // console.log('Question status changed:', changeData);
            // Immediately refresh questions to sync the change
            void fetchQuestions(false);
          }
        } catch (error) {
          console.error('Error parsing storage change:', error);
        }
      } else if (e.key === 'question_upvote_changed') {
        try {
          const changeData = JSON.parse(e.newValue || '{}');
          if (changeData.questionId && changeData.action) {
            // console.log('Question upvote changed:', changeData);
            // Immediately refresh questions to sync the upvote change
            void fetchQuestions(false);
          }
        } catch (error) {
          console.error('Error parsing upvote change:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const liveQuestions = useMemo(
    () => [...questions]
      .filter(q => q.status === 'active' || !q.status)
      .sort((a, b) => b.upVotes - a.upVotes || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [questions],
  );

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
            <h1 className="text-3xl font-bold text-[#0f5fc3]">Live Questions ({liveQuestions.length})</h1>
          </div>
        </div>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Loading live Questions</p>
        </Card>
      ) : liveQuestions.length === 0 ? (
        <Card className="p-12 text-center">
            <p className="text-muted-foreground">No live Questions yet.</p>
        </Card>
      ) : (
        <AdminLiveQuestions questions={liveQuestions} />
      )}
    </section>
  );
}
