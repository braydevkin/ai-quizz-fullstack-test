import { Award, ListChecks, Target, TrendingUp } from 'lucide-react'
import type { ComponentType } from 'react'

import { Card } from '@/components/ui/card'
import type { DashboardStats } from '@/features/dashboard/stats'

/** The four headline numbers, as a responsive row of tiles. */
export function StatTiles({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Tile icon={ListChecks} label="Quizzes taken" value={stats.totalAttempts} />
      <Tile icon={Target} label="Unique quizzes" value={stats.quizzesCompleted} />
      <Tile icon={TrendingUp} label="Average score" value={`${stats.averagePercent}%`} />
      <Tile icon={Award} label="Best score" value={`${stats.bestPercent}%`} />
    </div>
  )
}

function Tile({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string | number
}) {
  return (
    <Card className="gap-2 p-4">
      <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs font-medium">
        <Icon className="size-4" />
        {label}
      </span>
      <span className="text-2xl font-semibold tabular-nums">{value}</span>
    </Card>
  )
}
