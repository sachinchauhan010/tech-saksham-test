'use client';

import { useMemo, useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Edit, X, Save, Send, ThumbsUp, ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react';
import { Question } from '@/types/question';
import { useAppSelector } from '@/redux/hooks';
import apiClient from '@/lib/api-client';
import ComponentWrapper from '@/components/ComponentWrapper';

const formSchema = z.object({
  text: z
    .string()
    .min(10, 'Questions must be at least 10 characters')
    .max(200, 'Questions must be 200 characters or less'),
});

type FormValues = z.infer<typeof formSchema>;

export default function QuestionsPanelPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();

  const eventId = params.eventId as string;

  const { user } = useAppSelector((state) => state.user);
  const currentUserId = user?._id ?? null;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { text: '' },
  });

  useEffect(() => {
    if (!currentUserId) {
      setUserVotes(new Set());
      return;
    }
    const saved = localStorage.getItem(`userVotes_${currentUserId}`);
    setUserVotes(new Set(saved ? JSON.parse(saved) : []));
  }, [currentUserId]);

  useEffect(() => {
    if (!eventId || !user) return; // Wait for user to load

    let interval: NodeJS.Timeout;

    const verifyAccessAndLoad = async () => {
      try {
        const response = await apiClient.get('/api/event');
        if (response.data.success) {
          const events = response.data.data.upcomingEvents || [];
          const foundEvent = events.find((e: any) => e._id === eventId);

          if (!foundEvent) {
            toast.error("Event not found");
            router.push('/questions');
            return;
          }

          setEvent(foundEvent);

          const isAdmin = user?.role?.includes('admin');
          const hasApplied = user?.eventApplied?.some((e: any) => e.eventCode === foundEvent.eventCode);

          if (!isAdmin && !hasApplied) {
            toast.error("You must be registered for this event to access the Questions session.");
            router.push('/questions');
            return;
          }

          setIsCheckingAccess(false);
          fetchQuestions();
          interval = setInterval(fetchQuestions, 5000);
        }
      } catch (error) {
        console.error("Access check failed:", error);
        toast.error("Failed to verify access.");
        router.push('/questions');
      }
    };

    verifyAccessAndLoad();

    return () => clearInterval(interval);
  }, [eventId, user]);

  const fetchQuestions = async () => {
    try {
      const response = await apiClient.get(
        `/api/delegate/questions?eventId=${eventId}`
      );
      const data = response.data;
      if (data.success) {
        setQuestions(data.data);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.log('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.post(
        `/api/delegate/questions?eventId=${eventId}`,
        values
      );
      const data = response.data;
      if (data.success === false) throw new Error(data.error);
      form.reset();
      await fetchQuestions();
      toast.success('Question added successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add question');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (questionId: string) => {
    if (!currentUserId) {
      toast.error('Please login to vote');
      return;
    }

    const alreadyVoted = userVotes.has(questionId);

    try {
      let response;
      
      if (alreadyVoted) {
        // Remove upvote - use PUT method on increment endpoint (decrements by 1)
        response = await apiClient.put(
          `/api/delegate/questions/${questionId}/increment`
        );
      } else {
        // Add upvote - use POST method on increment endpoint (increments by 1)
        response = await apiClient.post(
          `/api/delegate/questions/${questionId}/increment`
        );
      }
      
      const data = response.data;

      if (data.success) {
        const newVotes = new Set(userVotes);
        alreadyVoted ? newVotes.delete(questionId) : newVotes.add(questionId);
        setUserVotes(newVotes);
        localStorage.setItem(
          `userVotes_${currentUserId}`,
          JSON.stringify(Array.from(newVotes))
        );
        await fetchQuestions();
        toast.success(alreadyVoted ? 'Upvote removed!' : 'Vote recorded!');
      } else {
        throw new Error(data.error || 'Failed to update vote');
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast.error(alreadyVoted ? 'Failed to remove upvote' : 'Failed to record vote');
    }
  };

  const handleSaveEdit = async (questionId: string) => {
    if (!editText.trim()) {
      toast.error('Question text cannot be empty');
      return;
    }
    try {
      const response = await apiClient.put(`/api/delegate/questions/${questionId}/edit`, {
        text: editText.trim(),
      });
      const data = response.data;
      if (data.success) {
        toast.success(data.message);
        fetchQuestions();
        setEditingQuestion(null);
        setEditText('');
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update question');
    }
  };

  const sortedQuestions = useMemo(
    () =>
      [...questions]
        .filter((q) => q.status === 'active')
        .sort(
          (a, b) =>
            b.upVotes - a.upVotes ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
    [questions]
  );

  if (isCheckingAccess) {
    return (
      <div className="min-h-screen bg-background w-full lg:max-w-7xl mx-auto flex items-center justify-center">
        <p className="text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  return (
    <ComponentWrapper>
    <div className="min-h-screen bg-background w-full lg:max-w-7xl mx-auto">
      <div className="container mx-auto px-4 py-8">

        {/* Header and Back Button */}
        <div className="flex items-center gap-4 mb-6">
          {/* <Button
            variant="outline"
            size="icon"
            onClick={() => router.push('/questions')}
            className="rounded-full shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button> */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">Live Questions</h1>
            <p className="text-sm text-slate-500">Ask questions to the speakers for this event.</p>
          </div>
        </div>

        {/* Event Details Card */}
        {event && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-100">
            <div className="px-4">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900 mb-3">{event.title}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString(undefined, {
                          weekday: "short",
                          month: "short", 
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>
                        {new Date(event.startDate).toLocaleTimeString([], { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })} - {new Date(event.endDate).toLocaleTimeString([], { 
                          hour: "2-digit", 
                          minute: "2-digit" 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span>{event.location?.venueName || event.location?.city || "Online Event"}</span>
                    </div>
                  </div>
                  <p className="text-slate-600 mt-3 line-clamp-2">{event.shortDescription}</p>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {event.category}
                  </span>
                  <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {event.format}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Questions List */}
        <Card className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="border-b border-blue-100 bg-[#edf7fc] px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-xl font-semibold text-slate-900">Live Questions ({sortedQuestions.length})</h3>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center text-muted-foreground">Loading Questions...</div>
          ) : sortedQuestions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No Questions yet. Be the first to ask!</div>
          ) : (
            <div>
              {sortedQuestions.map((question, index) => {
                if (editingQuestion === question._id) {
                  return (
                    <div key={question._id} className={`border-b border-blue-50 px-4 py-4 sm:px-6 ${index % 2 === 0
                      ? 'bg-[oklch(97%_0.014_254.604)]'
                      : 'bg-[oklch(96.7%_0.003_264.542)]'
                      }`}>
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-[80px] w-full resize-none rounded-lg border p-3 focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="Edit your Questions..."
                          aria-label="Edit Questions text"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(question._id)}
                            className="flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingQuestion(null);
                              setEditText('');
                            }}
                            className="flex items-center gap-2"
                          >
                            <X className="h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={question._id}
                    className={`border-b border-blue-50 px-2 py-2 last:border-b-0 sm:px-6 relative ${index % 2 === 0
                      ? 'bg-[oklch(97%_0.014_254.604)]'
                      : 'bg-[oklch(96.7%_0.003_264.542)]'
                      }`}
                  >
                    <div className="flex justify-center items-center w-full my-auto">
                      <Button
                        size="icon"
                        variant={userVotes.has(question._id) ? "default" : "outline"}
                        onClick={() => handleVote(question._id)}
                        className={userVotes.has(question._id)
                          ? "group relative h-10 w-10 pt-[2px] shrink-0 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-white cursor-pointer hover:from-blue-600 hover:to-indigo-700"
                          : "group relative h-10 w-10 pt-[2px] shrink-0 rounded-md border-blue-200 text-blue-600 cursor-pointer"
                        }
                        aria-label={userVotes.has(question._id)
                          ? `Remove upvote from question: ${question.text}. Current upvotes: ${question.upVotes}`
                          : `Upvote question: ${question.text}. Current upvotes: ${question.upVotes}`
                        }
                        title={userVotes.has(question._id) ? "Remove your upvote" : "Upvote this question"}
                      >
                        <div className="flex flex-col items-center leading-none">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="mt-0.5 text-xs font-semibold">{question.upVotes}</span>
                        </div>
                        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100">
                          {question.upVotes} upvotes
                        </span>
                      </Button>
                      <span className="flex mt-3 h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold">
                        {index + 1}
                      </span>

                      <div className="flex-1 min-w-0">
                        {index < 3 && (
                          <span className="absolute right-0 top-0 rounded-bl-lg bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[10px] font-semibold text-white shadow-sm">
                            TOP {index + 1}
                          </span>
                        )}
                        <div className="flex items-start justify-between gap-2 sm:gap-3 w-full">
                          <p className="text-sm sm:text-base mt-3 font-medium leading-relaxed text-slate-900 break-words min-w-0 flex-1">
                            {question.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Add Question Form */}
        <Card className="mt-4 rounded-xl border border-blue-100 bg-white px-4 py-2 shadow-sm gap-2">
          <h2 className="text-2xl font-semibold text-slate-900">Ask Your Questions</h2>
          <p className="text-sm text-slate-500">Please ensure that questions are relevant and do not exceed 2–3 lines.</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="sr-only">Your Query</FormLabel>
                    <FormControl>
                      <div className="relative rounded-2xl border border-blue-200 bg-[#eef4fb] p-3 focus-within:border-blue-300 focus-within:bg-white">
                        <textarea
                          {...field}
                          rows={3}
                          maxLength={200}
                          placeholder="Type your Questions for speaker here..."
                          className="max-h-44 min-h-[92px] w-full resize-y bg-transparent pr-14 text-sm text-slate-700 outline-none placeholder:text-slate-400"
                          aria-label="Type your query"
                        />
                        <span
                          className={`absolute bottom-14 right-3 text-xs font-medium ${(form.watch('text')?.length ?? 0) > 200
                            ? 'text-red-500'
                            : 'text-slate-400'
                            }`}
                        >
                          {form.watch('text')?.length ?? 0}/200
                        </span>
                        <Button
                          type="submit"
                          size="icon"
                          disabled={
                            isSubmitting ||
                            !form.watch('text')?.trim() ||
                            (form.watch('text')?.length ?? 0) > 200
                          }
                          className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-[#0f5fc3] text-white hover:bg-[#0c4ea0]"
                          aria-label="Send question"
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </Card>
      </div>
    </div>
    </ComponentWrapper>
  );
}
