'use client'

import { CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IdentityForm } from '@/features/identity/identity-form'
import { useUser } from '@/features/identity/user-context'
import { AttemptHistory } from '@/features/dashboard/attempt-history'
import { ProgressChart } from '@/features/dashboard/progress-chart'
import { StatTiles } from '@/features/dashboard/stat-tiles'
import { computeStats } from '@/features/dashboard/stats'
import { useAsync } from '@/hooks/use-async'
import { listAttempts } from '@/services/attempt.service'

/**
 * Progress dashboard: headline stats, a score-over-time chart and the full
 * attempt history. Requires an identified user — anonymous visitors are asked
 * to sign in first. The data fetch lives in a child that only mounts once a
 * user is known, so it always fetches with the right id.
 */
export function Dashboard() {
  const { user, status } = useUser()

  if (status === 'loading') {
    return <Card className="bg-muted/40 h-64 animate-pulse border-dashed" />
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-sm p-6">
        <h2 className="mb-1 font-semibold">Sign in to see your progress</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Your dashboard tracks every quiz you take, once we know who you are.
        </p>
        <IdentityForm />
      </Card>
    )
  }

  return <DashboardContent userId={user.id} />
}

function DashboardContent({ userId }: { userId: string }) {
  const load = useCallback(() => listAttempts(userId), [userId])
  const { data: attempts, loading, error } = useAsync(load)

  if (loading) {
    return <Card className="bg-muted/40 h-64 animate-pulse border-dashed" />
  }

  if (error || !attempts) {
    return (
      <Card className="flex items-center gap-3 p-6 text-sm">
        <CircleAlert className="text-destructive size-5 shrink-0" />
        <span>Couldn&apos;t load your history. Is the API running?</span>
      </Card>
    )
  }

  if (attempts.length === 0) {
    return (
      <Card className="space-y-4 p-6 text-center">
        <p className="text-muted-foreground">
          You haven&apos;t taken any quizzes yet. Your scores will show up here.
        </p>
        <Button asChild>
          <Link href="/">Browse quizzes</Link>
        </Button>
      </Card>
    )
  }

  const stats = computeStats(attempts)

  return (
    <div className="space-y-6">
      <StatTiles stats={stats} />
      <ProgressChart attempts={attempts} />
      <div>
        <h2 className="mb-3 text-lg font-semibold">History</h2>
        <AttemptHistory attempts={attempts} />
      </div>
    </div>
  )
}
