import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { AnswerRecord, PlayQuestion } from '@/features/quiz/play'

/**
 * A read-only walk through every question of a finished run: each prompt, the
 * options with the correct one and the player's pick marked, and the
 * explanation. Shared by the results screen (and, later, attempt review).
 */
export function ReviewList({
  questions,
  records,
}: {
  questions: PlayQuestion[]
  records: AnswerRecord[]
}) {
  return (
    <ol className="space-y-4">
      {questions.map((question, index) => {
        const record = records.find((candidate) => candidate.questionId === question.id)

        return (
          <li key={question.id} className="space-y-3 rounded-lg border p-4">
            <p className="font-medium">
              <span className="text-muted-foreground mr-2">{index + 1}.</span>
              {question.question}
            </p>

            <ul className="space-y-1.5 text-sm">
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.correctIndex
                const isChosen = record?.selectedIndex === optionIndex

                return (
                  <li
                    key={option.originalIndex}
                    className={cn(
                      'flex items-center justify-between gap-3 rounded-md px-3 py-2',
                      isCorrect && 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                      isChosen && !isCorrect && 'bg-destructive/10 text-destructive',
                    )}
                  >
                    <span>{option.text}</span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium">
                        <Check className="size-3.5" />
                        Correct
                      </span>
                    ) : isChosen ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium">
                        <X className="size-3.5" />
                        Your answer
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>

            <p className="text-muted-foreground text-sm">{question.explanation}</p>
          </li>
        )
      })}
    </ol>
  )
}
