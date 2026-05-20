'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { X, Check, MessageSquare, Loader2 } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import QuestionCard from '@/components/questions/QuestionCard';
import { Question } from '@/types/question';
import apiClient from '@/lib/api-client';

export default function AdminQuestionsPage() {
  const toast = useToast();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<Question[]>([]);
  const [removedQuestions, setRemovedQuestions] = useState<Question[]>([]);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [isRemovingAll, setIsRemovingAll] = useState(false);
  const [removingQuestionId, setRemovingQuestionId] = useState<string | null>(null);
  const [isAnswerAllDialogOpen, setIsAnswerAllDialogOpen] = useState(false);
  const [isAnsweringAll, setIsAnsweringAll] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await apiClient.get('/api/delegate/questions');
      const data = response.data;

      if (data.success) {
        const allQuestions = data.data;

        const activeQuestions = allQuestions.filter((q: Question) => q.status === 'active' || !q.status);
        const answered = allQuestions.filter((q: Question) => q.status === 'answered');
        const removed = allQuestions.filter((q: Question) => q.status === 'removed');

        setQuestions(activeQuestions);
        setAnsweredQuestions(answered);
        setRemovedQuestions(removed);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchQuestions();
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  const handleRemoveQuestion = async (questionId: string) => {
    setRemovingQuestionId(questionId);
    try {
      const response = await apiClient.put(`/api/delegate/questions/${questionId}/status`, {
        status: 'removed',
      });

      const result = response.data;

      if (result.success) {
        toast.success('Question removed successfully');
        localStorage.setItem('question_status_changed', JSON.stringify({
          questionId,
          status: 'removed',
          timestamp: Date.now()
        }));
        fetchQuestions();
      } else {
        toast.error(result.error || 'Failed to remove question');
      }
    } catch (error) {
      toast.error('Failed to remove question');
    } finally {
      setRemovingQuestionId(null);
    }
  };

  const handleRemoveAllQuestion = async () => {
    if (questions.length !== 0) {
      setIsRemovingAll(true);
      try {
        const response = await apiClient.put(`/api/delegate/questions`, {
          status: 'removed',
        });

        const result = response.data;
        if (result.success) {
          toast.success('All questions removed successfully');
          localStorage.setItem('question_status_changed', JSON.stringify({
            action: 'remove_all',
            status: 'removed',
            timestamp: Date.now()
          }));
          fetchQuestions();
        } else {
          toast.error(result.error || 'Failed to remove all questions');
        }
      } catch (error) {
        toast.error('Failed to remove all questions');
      } finally {
        setIsRemovingAll(false);
      }
    }
  };

  const confirmRemoveAllQuestions = () => {
    handleRemoveAllQuestion();
    setIsRemoveDialogOpen(false);
  };

  const handleAnswerAllQuestions = async () => {
    if (questions.length !== 0) {
      setIsAnsweringAll(true);
      try {
        const response = await apiClient.put(`/api/delegate/questions`, {
          status: 'answered',
        });

        const result = response.data;
        if (result.success) {
          toast.success('All questions marked as answered');
          localStorage.setItem('question_status_changed', JSON.stringify({
            action: 'answer_all',
            status: 'answered',
            timestamp: Date.now()
          }));
          fetchQuestions();
        } else {
          toast.error(result.error || 'Failed to mark all as answered');
        }
      } catch (error) {
        toast.error('Failed to mark all as answered');
      } finally {
        setIsAnsweringAll(false);
      }
    }
  };

  const confirmAnswerAllQuestions = () => {
    handleAnswerAllQuestions();
    setIsAnswerAllDialogOpen(false);
  };

  const handleMarkAsAnswered = async (questionId: string) => {
    try {
      const response = await apiClient.put(`/api/delegate/questions/${questionId}/status`, {
        status: 'answered',
      });

      const result = response.data;

      if (result.success) {
        toast.success('Question marked as answered');
        localStorage.setItem('question_status_changed', JSON.stringify({
          questionId,
          status: 'answered',
          timestamp: Date.now()
        }));
        fetchQuestions();
      } else {
        toast.error(result.error || 'Failed to mark question as answered');
      }
    } catch (error) {
      toast.error('Failed to mark question as answered');
    }
  };

  const handleMarkAsNotAnswered = async (questionId: string) => {
    try {
      const response = await apiClient.put(`/api/delegate/questions/${questionId}/status`, {
        status: 'active',
      });

      const result = response.data;

      if (result.success) {
        toast.success('Question marked as not answered');
        localStorage.setItem('question_status_changed', JSON.stringify({
          questionId,
          status: 'active',
          timestamp: Date.now()
        }));
        fetchQuestions();
      } else {
        toast.error(result.error || 'Failed to mark question as not answered');
      }
    } catch (error) {
      toast.error('Failed to mark question as not answered');
    }
  };

  const renderQuestionList = (list: Question[], emptyState: string, tabType: 'live' | 'answered' | 'removed' = 'live') => {
    if (list.length === 0) {
      return (
        <Card className="rounded-xl border border-blue-100 p-6 text-center text-sm text-muted-foreground gap-2">
          {emptyState}
        </Card>
      );
    }

    const getRightActions = (question: Question) => {
      if (tabType === 'live') {
        return (
          <div className="flex flex-col items-start justify-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="border-green-200 text-green-700 hover:text-white hover:bg-green-500 cursor-pointer w-[130px]"
              onClick={() => handleMarkAsAnswered(question._id)}
              aria-label="Mark question as answered"
            >
              <Check className="mr-1 h-4 w-4" />
              Answered
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700 hover:text-white hover:bg-red-500 cursor-pointer w-[130px]"
              onClick={() => handleRemoveQuestion(question._id)}
              aria-label="Remove question"
              disabled={removingQuestionId === question._id}
            >
              {removingQuestionId === question._id ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="mr-1 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </div>
        );
      } else if (tabType === 'answered') {
        return (
          <div className="flex flex-col items-start justify-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-700 hover:text-white cursor-pointer w-[130px]"
              onClick={() => handleMarkAsNotAnswered(question._id)}
              aria-label="Mark question as not answered"
            >
              <Check className="mr-1 h-4 w-4" />
              Not Answered
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700 hover:text-white hover:bg-red-500 cursor-pointer w-[130px]"
              onClick={() => handleRemoveQuestion(question._id)}
              aria-label="Remove question"
              disabled={removingQuestionId === question._id}
            >
              {removingQuestionId === question._id ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="mr-1 h-4 w-4" />
                  Remove
                </>
              )}
            </Button>
          </div>
        );
      } else {
        // removed tab
        return (
          <div className="flex flex-col items-start justify-center gap-1">
            <Button
              size="sm"
              variant="outline"
              className="border-blue-200 text-blue-700 hover:bg-blue-700 hover:text-white cursor-pointer w-[130px]"
              onClick={() => handleMarkAsNotAnswered(question._id)}
              aria-label="Mark question as not answered"
            >
              <Check className="mr-1 h-4 w-4" />
              Not Answered
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-green-200 text-green-700 hover:text-white hover:bg-green-500 cursor-pointer w-[130px] text-start"
              onClick={() => handleMarkAsAnswered(question._id)}
              aria-label="Mark question as answered"
            >
              <Check className="mr-1 h-4 w-4" />
              Answered
            </Button>
          </div>
        );
      }
    };

    return (
      <div className="space-y-3">
        {list.map((question, index) => (
          <QuestionCard
            key={question._id}
            question={question}
            index={index}
            className={`border border-blue-100 p-2 shadow-sm ${index % 2 === 0
              ? 'bg-[oklch(97%_0.014_254.604)]'
              : 'bg-[oklch(96.7%_0.003_264.542)]'
              }`}
            showUserInfo={false}
            showMeta={false}
            rightActions={getRightActions(question)}
          />
        ))}
      </div>
    );
  };

  return (
    <section className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm sm:p-6">
      <div>
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#0f5fc3]">Manage Questions</h1>
            <p className="mt-1 text-muted-foreground">
              Manage and review most asked questions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-green-200 text-green-700 hover:text-white hover:bg-green-500 cursor-pointer"
              onClick={() => setIsAnswerAllDialogOpen(true)}
              aria-label="Answer all questions"
              disabled={questions.length === 0 || isAnsweringAll}
            >
              {isAnsweringAll ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Answering...
                </>
              ) : (
                <>
                  <Check className="mr-1 h-4 w-4" />
                  Answer All
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-200 text-red-700 hover:text-white hover:bg-red-500 cursor-pointer"
              onClick={() => setIsRemoveDialogOpen(true)}
              aria-label="Remove all questions"
              disabled={questions.length === 0 || isRemovingAll}
            >
              {isRemovingAll ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                <>
                  <X className="mr-1 h-4 w-4" />
                  Remove All
                </>
              )}
            </Button>
          </div>
        </div>

        <AlertDialog open={isAnswerAllDialogOpen} onOpenChange={setIsAnswerAllDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Answer All Questions?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark all {questions.length} questions as answered?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmAnswerAllQuestions}
                className="bg-green-600 hover:bg-green-700"
                disabled={isAnsweringAll}
              >
                {isAnsweringAll ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Answering...
                  </>
                ) : (
                  'Answer All'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove All Questions?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove all {questions.length} questions? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmRemoveAllQuestions}
                className="bg-red-600 hover:bg-red-700"
                disabled={isRemovingAll}
              >
                {isRemovingAll ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove All'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Tabs defaultValue="live" className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-1 md:grid-cols-3 lg:grid-cols-3 rounded-2xl bg-slate-100 p-1">
            <TabsTrigger value="live" className="rounded-xl py-2">
              <MessageSquare className="mr-1 h-4 w-4" />
              Live Questions ({questions.length})
            </TabsTrigger>
            <TabsTrigger value="answered" className="rounded-xl py-2">
              <Check className="mr-1 h-4 w-4" />
              Answered ({answeredQuestions.length})
            </TabsTrigger>
            <TabsTrigger value="removed" className="rounded-xl py-2">
              <X className="mr-1 h-4 w-4" />
              Removed Questions ({removedQuestions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="live" className="mt-4">
            {renderQuestionList(questions, 'No live Questions available.', 'live')}
          </TabsContent>

          <TabsContent value="answered" className="mt-4">
            {renderQuestionList(answeredQuestions, 'No answered questions yet.', 'answered')}
          </TabsContent>

          <TabsContent value="removed" className="mt-4">
            {renderQuestionList(removedQuestions, 'No removed questions yet.', 'removed')}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}