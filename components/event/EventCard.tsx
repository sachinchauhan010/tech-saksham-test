import { IEvent } from "@/types/interface";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAppSelector } from "@/redux/hooks";
import apiClient from "@/lib/api-client";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
  event: IEvent;
  onApply?: (eventCode: string) => void;
  isShowJoinQuestion?: boolean;
}

export default function EventCard({ event, onApply, isShowJoinQuestion = false }: Props) {

  const { user } = useAppSelector((state) => state.user);
  const [isApplied, setIsApplied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user && (user as any).eventApplied) {
      const applied = (user as any).eventApplied.some(
        (e: any) => e.eventCode === event.eventCode
      );
      setIsApplied(applied);
    }
  }, [user, event.eventCode]);

  const isRegistrationOver = () => {
    if (!event.registrationCloseDate) return false;
    const now = new Date();
    const regCloseDate = new Date(event.registrationCloseDate);
    return now > regCloseDate;
  };

    const handleJoinQuestions = (event: IEvent) => {
    const hasApplied = user?.eventApplied?.some((e) => e.eventCode === event.eventCode);

    if (hasApplied) {
      localStorage.setItem("event_id", event._id as string);
      localStorage.setItem("event_ends_at", String(event.endDate));
      router.push(`/questions/${event._id}`);
    } else {
      toast.error('You must apply for this event before joining the Questions session.');
    }
  };

  const handleApplyClick = async () => {
    if (isApplied) return;

    if (!user) {
      toast.error("Please login to apply for events");
      return;
    }

    if (isRegistrationOver()) {
      toast.error("Registration period for this event has ended");
      return;
    }

    try {
      const { data } = await apiClient.post(`/api/event/${event._id}/apply`);
      if (data.success) {
        toast.success(data.message);
        setIsApplied(true);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to apply for event");
    }

    if (onApply) {
      onApply(event.eventCode);
    }
  };

  const handleRemoveApplication = async () => {
    if (!user) {
      toast.error("Please login to remove applications");
      return;
    }

    try {
      const { data } = await apiClient.delete(`/api/event/${event._id}/apply`);
      if (data.success) {
        toast.success(data.message);
        setIsApplied(false);
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to remove application");
    }

    if (onApply) {
      onApply(event.eventCode);
    }
  };

const now = Date.now();

const startTime = Math.min(
  ...event.sessions.map((s) => new Date(s.startTime).getTime())
);

const endTime = Math.max(
  ...event.sessions.map((s) => new Date(s.endTime).getTime())
);

const isQuestionSessionStarted =
  now >= startTime && now <= endTime;
  
  const cardImage =
    // event?.bannerImage?.includes("http") ?
    event.bannerImage
  // : "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=600&auto=format&fit=crop";

  return (
    <div className="flex flex-col h-full bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
      <div className="relative h-48 sm:h-56 w-full overflow-hidden">
        <img
          src={cardImage}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
        <div className="absolute top-4 left-4 flex flex-col gap-2 items-start">
          <span className="bg-white/90 backdrop-blur text-slate-800 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {event.category}
          </span>
          {/* <span className="bg-blue-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            {event.idcard?.charAt(0).toUpperCase() + event.idcard?.slice(1)}
          </span> */}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-xl font-extrabold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors mb-2">
          {event.title}
        </h2>
        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed flex-grow mb-4">
          {event.shortDescription}
        </p>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <Calendar className="w-4 h-4 mr-2 text-blue-500 shrink-0" />
            <span className="truncate">
              {new Date(event.startDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center text-sm text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <MapPin className="w-4 h-4 mr-2 text-purple-500 shrink-0" />
            <span className="truncate">
              {event.location.city || event.location.venueName}
            </span>
          </div>
        </div>

        {/* {
          isShowJoinQuestion && isApplied && (
            <Button
              onClick={() => handleJoinQuestions(event)}
              disabled={isQuestionSessionStarted}
              className="flex-1 h-14 rounded-xl mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 font-bold group/btn shadow-md shadow-blue-500/20"
            >
              Join Questions
              <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
          )
        }

        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center gap-5">
          <Link
            href={`/event/${event?.eventCode}`}
            className="block w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
          >
            View Details <ArrowRight className="w-4 h-4" />
          </Link>
          {isApplied && !isRegistrationOver() ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border group/btn shadow-sm hover:shadow-md bg-red-500 hover:bg-red-600 text-white border-red-600"
                >
                  Remove Application
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove Event Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to remove your application for "{event.title}"? This action cannot be undone and you will need to apply again if you change your mind.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRemoveApplication} className="bg-red-500 hover:bg-red-600">
                    Remove Application
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : isRegistrationOver() ? (
            <button
              disabled
              className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            >
              Registration Closed
            </button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  className="w-full font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border group/btn shadow-sm hover:shadow-md bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white border-slate-200 hover:border-blue-600"
                >
                  Apply Now
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Event Application</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to apply for "{event.title}"? This action will register you for the event and you will receive further details via email.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleApplyClick}>Apply Now</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div> */}
      </div>
    </div>
  );
}