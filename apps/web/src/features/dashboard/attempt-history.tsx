import type { AttemptSummary } from '@quiz/shared'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

import { percentOf } from '@/features/dashboard/stats'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/** The full attempt history, newest first, each row linking to its review. */
export function AttemptHistory({ attempts }: { attempts: AttemptSummary[] }) {
  return (
    <ul className="divide-y rounded-lg border">
      {attempts.map((attempt) => {
        const percent = percentOf(attempt)

        return (
          <li key={attempt.id}>
            <Link
              href={`/attempts/${attempt.id}`}
              className="hover:bg-accent flex items-center gap-4 p-4 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{attempt.quizTitle}</p>
                <p className="text-muted-foreground text-sm">{formatDateTime(attempt.createdAt)}</p>
              </div>

              <div className="text-right">
                <p
                  className={cn(
                    'font-semibold tabular-nums',
                    percent >= 80
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : percent >= 50
                        ? ''
                        : 'text-destructive',
                  )}
                >
                  {percent}%
                </p>
                <p className="text-muted-foreground text-sm tabular-nums">
                  {attempt.score}/{attempt.total}
                </p>
              </div>

              <ChevronRight className="text-muted-foreground size-4 shrink-0" />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
