'use client'

import { getPerformanceTier, type AnswerInput, type User } from '@quiz/shared'
import { CircleCheck, House, LoaderCircle, RotateCcw, TriangleAlert } from 'lucide-react'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IdentityForm } from '@/features/identity/identity-form'
import { useUser } from '@/features/identity/user-context'
import type { AnswerRecord, PlayQuestion } from '@/features/quiz/play'
import { ReviewList } from '@/features/quiz/review-list'
import { submitAttempt } from '@/services/attempt.service'

/**
 * Terminal screen of a run: the score with a performance headline, a prompt to
 * save (or sign in to save), the answer review, and retake / home actions.
 *
 * A scored run is submitted to the API once a user is known — either already
 * signed in, or after they identify here. Learn-Mode runs are practice and
 * aren't saved.
 */
export function Results({
  quizId,
  score,
  total,
  percentage,
  learnMode,
  questions,
  records,
  answerInputs,
  onRetake,
}: {
  quizId: string
  score: number
  total: number
  percentage: number
  learnMode: boolean
  questions: PlayQuestion[]
  records: AnswerRecord[]
  answerInputs: AnswerInput[]
  onRetake: () => void
}) {
  const performance = getPerformanceTier(percentage)

  return (
    <div className="space-y-6">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-lg font-medium">{performance.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-5xl font-semibold tabular-nums">{percentage}%</p>
          <p className="text-muted-foreground">
            You scored {score} out of {total}. {performance.message}
          </p>

          {learnMode ? (
            <p className="text-muted-foreground text-sm">
              Learn Mode — this practice run isn&apos;t saved.
            </p>
          ) : (
            <SaveStatus quizId={quizId} answerInputs={answerInputs} />
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Button onClick={onRetake}>
              <RotateCcw className="size-4" />
              Retake quiz
            </Button>
            <Button variant="outline" asChild>
              <Link href="/">
                <House className="size-4" />
                Back to quizzes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Review your answers</h2>
        <ReviewList questions={questions} records={records} />
      </div>
    </div>
  )
}

type SaveState = 'idle' | 'saved' | 'error'

/** Persists the scored run once a user is known, prompting to sign in if not. */
function SaveStatus({ quizId, answerInputs }: { quizId: string; answerInputs: AnswerInput[] }) {
  const { user } = useUser()
  const [state, setState] = useState<SaveState>('idle')
  const submitted = useRef(false)

  const runSave = useCallback(
    (who: User) => {
      submitted.current = true
      submitAttempt({ userId: who.id, quizId, answers: answerInputs })
        .then(() => setState('saved'))
        .catch(() => setState('error'))
    },
    [quizId, answerInputs],
  )

  useEffect(() => {
    // Fires once a user is present; `runSave` is called rather than setting
    // state here, so nothing is set synchronously inside the effect.
    if (!user || submitted.current) return
    runSave(user)
  }, [user, runSave])

  if (!user) {
    return (
      <Card className="mx-auto mt-2 max-w-sm p-5 text-left">
        <p className="mb-3 text-sm font-medium">Save this score</p>
        <p className="text-muted-foreground mb-4 text-sm">
          Enter your name and email to keep your results across sessions.
        </p>
        <IdentityForm />
      </Card>
    )
  }

  if (state === 'saved') {
    return (
      <p className="inline-flex flex-wrap items-center justify-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400">
        <CircleCheck className="size-4" />
        Score saved to your history.
        <Link href="/dashboard" className="text-primary underline underline-offset-4">
          View dashboard
        </Link>
      </p>
    )
  }

  if (state === 'error') {
    return (
      <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
        <TriangleAlert className="text-destructive size-4" />
        Couldn&apos;t save your score.
        <button
          type="button"
          className="text-primary underline underline-offset-4"
          onClick={() => {
            setState('idle')
            runSave(user)
          }}
        >
          Retry
        </button>
      </p>
    )
  }

  return (
    <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
      <LoaderCircle className="size-4 animate-spin" />
      Saving your score…
    </p>
  )
}
