import { CircleCheck, CircleX, Lightbulb } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * The explanation panel shown after answering — or, in Learn Mode, before.
 *
 * `answered` drives the correct/incorrect headline; when it's a Learn-Mode
 * preview the panel is neutral and just teaches.
 */
export function Feedback({
  answered,
  correct,
  explanation,
}: {
  answered: boolean
  correct: boolean
  explanation: string
}) {
  const tone = !answered
    ? 'border-border bg-muted/50'
    : correct
      ? 'border-emerald-500/40 bg-emerald-500/10'
      : 'border-destructive/40 bg-destructive/10'

  return (
    <div className={cn('space-y-2 rounded-lg border p-4 text-sm', tone)}>
      <p className="flex items-center gap-2 font-medium">
        {!answered ? (
          <>
            <Lightbulb className="size-4" />
            Explanation
          </>
        ) : correct ? (
          <>
            <CircleCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
            Correct
          </>
        ) : (
          <>
            <CircleX className="text-destructive size-4" />
            Not quite
          </>
        )}
      </p>
      <p className="text-muted-foreground">{explanation}</p>
    </div>
  )
}
