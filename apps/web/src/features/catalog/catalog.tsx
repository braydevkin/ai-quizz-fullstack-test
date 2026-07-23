'use client'

import { CircleAlert } from 'lucide-react'

import { Card } from '@/components/ui/card'
import { QuizCard } from '@/features/catalog/quiz-card'
import { useAsync } from '@/hooks/use-async'
import { listQuizzes } from '@/services/quiz.service'

/**
 * The quiz catalogue: fetches the summaries client-side (so the browser talks
 * to the API directly, per the Docker URL note) and renders a card grid, with
 * skeletons while loading and a friendly message on failure or an empty set.
 */
export function Catalog() {
  const { data: quizzes, loading, error } = useAsync(listQuizzes)

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-muted/40 h-48 animate-pulse border-dashed" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card className="flex items-center gap-3 p-6 text-sm">
        <CircleAlert className="text-destructive size-5 shrink-0" />
        <span>Couldn&apos;t load the quizzes. Is the API running?</span>
      </Card>
    )
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <Card className="text-muted-foreground p-6 text-sm">
        No quizzes yet. Seed some content with <code className="font-mono">pnpm db:seed</code>.
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {quizzes.map((quiz) => (
        <QuizCard key={quiz.id} quiz={quiz} />
      ))}
    </div>
  )
}
