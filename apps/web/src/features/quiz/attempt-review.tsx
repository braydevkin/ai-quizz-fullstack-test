'use client'

import { getPerformanceTier, type Attempt } from '@quiz/shared'
import { useCallback } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { buildQuestions, type AnswerRecord } from '@/features/quiz/play'
import { ReviewList } from '@/features/quiz/review-list'
import { useAsync } from '@/hooks/use-async'
import { formatDateTime } from '@/lib/format'
import { getQuiz } from '@/services/quiz.service'

/**
 * Review of a stored attempt.
 *
 * The attempt records only the option indices it scored, so the quiz is
 * re-fetched to put text and explanations back around them. With no shuffling,
 * a stored index lines up with the question's original option order, so the
 * play model can be reused verbatim for the review. If the quiz has since been
 * deleted, the score still shows — just without the per-question breakdown.
 */
export function AttemptReview({ attempt }: { attempt: Attempt }) {
  const load = useCallback(() => getQuiz(attempt.quizId), [attempt.quizId])
  const { data: quiz, loading, error } = useAsync(load)

  const percentage = attempt.total === 0 ? 0 : Math.round((attempt.score / attempt.total) * 100)
  const performance = getPerformanceTier(percentage)

  const records: AnswerRecord[] = attempt.answers.map((answer) => ({
    questionId: answer.questionId,
    selectedIndex: answer.selectedAnswer,
    correct: answer.correct,
  }))

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{attempt.quizTitle}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <p className="text-3xl font-semibold tabular-nums">{percentage}%</p>
          <p className="text-muted-foreground">
            {attempt.score} of {attempt.total} correct · {performance.label}
          </p>
          <p className="text-muted-foreground text-sm">{formatDateTime(attempt.createdAt)}</p>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="bg-muted/40 h-48 animate-pulse border-dashed" />
      ) : error || !quiz ? (
        <Card className="text-muted-foreground p-6 text-sm">
          The quiz for this attempt is no longer available, so the answers can&apos;t be shown.
        </Card>
      ) : (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Answers</h2>
          <ReviewList
            questions={buildQuestions(quiz, { randomize: false, learnMode: false })}
            records={records}
          />
        </div>
      )}
    </div>
  )
}
