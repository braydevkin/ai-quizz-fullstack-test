'use client'

import { ArrowLeft, CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { use, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AttemptReview } from '@/features/quiz/attempt-review'
import { useAsync } from '@/hooks/use-async'
import { getAttempt } from '@/services/attempt.service'

/**
 * `/attempts/[id]` — review a single past attempt. Loads the attempt
 * client-side, then hands it to the review, which fetches the quiz content.
 */
export default function AttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const load = useCallback(() => getAttempt(id), [id])
  const { data: attempt, loading, error } = useAsync(load)

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/dashboard">
          <ArrowLeft className="size-4" />
          Back to dashboard
        </Link>
      </Button>

      {loading ? (
        <Card className="bg-muted/40 h-64 animate-pulse border-dashed" />
      ) : error || !attempt ? (
        <Card className="flex items-center gap-3 p-6 text-sm">
          <CircleAlert className="text-destructive size-5 shrink-0" />
          <span>We couldn&apos;t load this attempt.</span>
        </Card>
      ) : (
        <AttemptReview attempt={attempt} />
      )}
    </main>
  )
}
