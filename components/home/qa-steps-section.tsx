import Link from 'next/link';
import { CheckCircle2, MessageSquareText, ThumbsUp } from 'lucide-react';

export function QaStepsSection() {
  return (
    <section className="bg-gradient-to-r from-[#eef3f7] to-[#e6f3f5] px-4 py-14 sm:px-6">
      <div className="mx-auto w-full max-w-7xl">
        <h3 className="text-center mt-4 text-center text-3xl font-bold text-[#111f3a] sm:text-5xl">How Live Questions Works</h3>
        <p className="mt-3 text-center text-slate-500">Participate in real-time interactive sessions</p>

        <div className="mt-10 grid gap-8 md:grid-cols-3">
          <Link href="/questions" className="text-center">
            <div className="relative mx-auto inline-flex rounded-2xl bg-gradient-to-br from-[#4e6eff] to-[#17ace6] p-4 text-white shadow-md">
              <MessageSquareText className="h-7 w-7" />
              <span className="absolute -right-2 -top-2 rounded-full bg-[#1594df] px-2 text-xs font-bold text-white">1</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#111f3a] sm:text-3xl">Ask Questions</p>
            <p className="mt-1 text-[15px] text-slate-500">Submit your questions during live Questions window</p>
          </Link>
          <div className="text-center">
            <div className="relative mx-auto inline-flex rounded-2xl bg-gradient-to-br from-[#6a59ff] to-[#1594df] p-4 text-white shadow-md">
              <ThumbsUp className="h-7 w-7" />
              <span className="absolute -right-2 -top-2 rounded-full bg-[#1594df] px-2 text-xs font-bold text-white">2</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#111f3a] sm:text-3xl">Vote & Engage</p>
            <p className="mt-1 text-[15px] text-slate-500">Upvote Questions you find most relevant</p>
          </div>
          <div className="text-center">
            <div className="relative mx-auto inline-flex rounded-2xl bg-gradient-to-br from-[#1a93dc] to-[#26b7e9] p-4 text-white shadow-md">
              <CheckCircle2 className="h-7 w-7" />
              <span className="absolute -right-2 -top-2 rounded-full bg-[#1594df] px-2 text-xs font-bold text-white">3</span>
            </div>
            <p className="mt-4 text-2xl font-bold text-[#111f3a] sm:text-3xl">Get Answers</p>
            <p className="mt-1 text-[15px] text-slate-500">Top Questions get answered by expert speakers</p>
          </div>
        </div>
      </div>
    </section>
  );
}
