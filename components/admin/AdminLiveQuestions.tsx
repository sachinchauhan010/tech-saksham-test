'use client';

import { Question } from '@/types/question';
import LiveQuestionCard from '../questions/LiveQuestionCard';

type AdminLiveQuestionsProps = {
  questions: Question[];
};

export default function AdminLiveQuestions({ questions }: AdminLiveQuestionsProps) {
  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <LiveQuestionCard
          key={question._id}
          question={question}
          index={index}
          className={`border-l-4 border-l-blue-500 px-4 py-1 shadow-sm transition-all duration-200 hover:shadow-md ${index % 2 === 0
            ? 'bg-[oklch(97%_0.014_254.604)]'
            : 'bg-[oklch(96.7%_0.003_264.542)]'
            }`}
          showMeta={false}
          showUserInfo={false}
          showtime={false}
        />
      ))}
    </div>
  );
}
