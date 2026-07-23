import type { AttemptSummary } from '@quiz/shared'

import { Card } from '@/components/ui/card'
import { percentOf } from '@/features/dashboard/stats'
import { cn } from '@/lib/utils'

/**
 * Scores over time as a simple column chart — one bar per attempt, oldest to
 * newest. Built from divs rather than a chart library to keep the pinned
 * dependency set unchanged; the bar colour tracks the performance tier.
 */
export function ProgressChart({ attempts }: { attempts: AttemptSummary[] }) {
  // The API returns newest first; a timeline reads oldest to newest. Cap the
  // width so a long history stays legible.
  const timeline = [...attempts].reverse().slice(-20)

  return (
    <Card className="p-5">
      <h3 className="mb-4 text-sm font-medium">Scores over time</h3>
      <div className="flex h-40 items-end gap-1.5">
        {timeline.map((attempt) => {
          const percent = percentOf(attempt)

          return (
            <div
              key={attempt.id}
              className="flex h-full flex-1 items-end"
              title={`${attempt.quizTitle}: ${percent}%`}
            >
              <div
                className={cn(
                  'w-full rounded-t-sm transition-all',
                  percent >= 80
                    ? 'bg-emerald-500'
                    : percent >= 50
                      ? 'bg-primary'
                      : 'bg-destructive',
                )}
                style={{ height: `${Math.max(percent, 2)}%` }}
              />
            </div>
          )
        })}
      </div>
      <div className="text-muted-foreground mt-2 flex justify-between text-xs">
        <span>Oldest</span>
        <span>Most recent</span>
      </div>
    </Card>
  )
}
