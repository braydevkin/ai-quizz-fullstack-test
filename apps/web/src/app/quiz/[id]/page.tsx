'use client'

import { ArrowLeft, CircleAlert } from 'lucide-react'
import Link from 'next/link'
import { use, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { QuizRunner } from '@/features/quiz/quiz-runner'
import { useAsync } from '@/hooks/use-async'
import { getQuiz } from '@/services/quiz.service'

/**
 * `/quiz/[id]` — loads a quiz client-side (so the browser reaches the API
 * directly) and hands it to the runner. Params arrive as a promise in the App
 * Router and are unwrapped with `use`.
 */
export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const load = useCallback(() => getQuiz(id), [id])
  const { data: quiz, loading, error } = useAsync(load)

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/">
          <ArrowLeft className="size-4" />
          All quizzes
        </Link>
      </Button>

      {loading ? (
        <Card className="bg-muted/40 h-64 animate-pulse border-dashed" />
      ) : error || !quiz ? (
        <Card className="flex items-center gap-3 p-6 text-sm">
          <CircleAlert className="text-destructive size-5 shrink-0" />
          <span>We couldn&apos;t load this quiz. It may not exist, or the API is unreachable.</span>
        </Card>
      ) : (
        <QuizRunner quiz={quiz} />
      )}
    </main>
  )
}
