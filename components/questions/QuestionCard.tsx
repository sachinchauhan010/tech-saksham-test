'use client';

import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThumbsUp } from 'lucide-react';
import { Question } from '@/types/question';

type QuestionCardProps = {
  question: Question;
  className?: string;
  index?: number;
  showMeta?: boolean;
  showtime?: boolean;
  metaLabel?: string;
  showUserInfo?: boolean;
  rightActions?: ReactNode;
  onUpvote?: (questionId: string) => void;
  upvoteDisabled?: boolean;
  upvoted?: boolean;
  upvoteLabel?: string;
  compactVotes?: boolean;
};

export default function QuestionCard({
  question,
  className,
  index,
  showMeta = true,
  metaLabel = 'Submitted',
  showUserInfo = false,
  rightActions,
  showtime,
  onUpvote,
  upvoteDisabled = false,
  upvoted = false,
  upvoteLabel = 'Upvote this question',
  compactVotes = false,
}: QuestionCardProps) {
  return (
    <Card className={className ?? 'transition-shadow hover:shadow-md w-full px-4'}>
      <div className="flex w-full items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="break-words text-foreground text-base sm:text-base md:text-xl font-base">
            {index !== undefined && (
              <span className="mr-1">
                {index + 1}.
              </span>
            )}
            {question.text}
          </p>

          {showUserInfo && (
            <div className="mt-3 rounded-lg bg-muted/50 p-3 w-fit">
              <div className="flex items-center gap-2 text-sm">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10"
                  aria-hidden="true"
                >
                  <span className="text-xs font-semibold text-primary">
                    {question.userName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-foreground">{question.userName || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">
                    {question.userDepartment || 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {showMeta && (
            <p className="mt-2 text-sm text-muted-foreground">
              {metaLabel} {new Date(question.createdAt).toLocaleString()}
            </p>
          )}

          {showtime && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{new Date(question.createdAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div>
            {onUpvote ? (
              <Button
                size="icon"
                variant={upvoted ? 'default' : 'outline'}
                onClick={() => onUpvote(question._id)}
                disabled={upvoteDisabled}
                className="rounded-full"
                aria-label={`${upvoteLabel}. Current upvotes: ${question.upVotes}`}
                title={`Upvotes: ${question.upVotes}`}
              >
                <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-8 lg:w-8" />
              </Button>
            ) : (
              <div className="min-w-[80px] rounded-xl px-2 py-1 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-700">
                  <ThumbsUp className="h-4 w-4" />
                  <span className="text-base sm:text-base md:text-lg lg:text-xl font-semibold text-[#0f5fc3]">{question.upVotes}</span>
                </div>
                <p className="text-xs sm:text-xs md:text-sm lg:text-sm uppercase font-medium tracking-wide text-[#0f5fc3]">Upvotes</p>
              </div>
            )}
          </div>

          {rightActions && (
            <div className="flex flex-col items-center gap-2">
              {rightActions}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
