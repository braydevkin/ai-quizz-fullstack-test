import { Progress } from '@/components/ui/progress'

/**
 * "Question 3 of 5" plus a bar, so the player always knows how far along the
 * run is. `current` is 1-based.
 */
export function ProgressIndicator({ current, total }: { current: number; total: number }) {
  const percentage = total === 0 ? 0 : (current / total) * 100

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground flex items-center justify-between text-sm font-medium">
        <span>
          Question {current} of {total}
        </span>
        <span>{Math.round(percentage)}%</span>
      </div>
      <Progress value={percentage} />
    </div>
  )
}
