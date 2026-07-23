'use client'

import { ArrowRight, Flag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AnswerOption, type OptionState } from '@/features/quiz/answer-option'
import { Feedback } from '@/features/quiz/feedback'
import type { PlayQuestion } from '@/features/quiz/play'

/**
 * A single question: the prompt, its options with immediate right/wrong
 * feedback once answered, the explanation, and the advance button.
 */
export function QuestionCard({
  question,
  selectedIndex,
  answered,
  learnMode,
  isLast,
  onAnswer,
  onNext,
}: {
  question: PlayQuestion
  selectedIndex: number | null
  answered: boolean
  learnMode: boolean
  isLast: boolean
  onAnswer: (optionIndex: number) => void
  onNext: () => void
}) {
  const stateFor = (index: number): OptionState => {
    if (!answered) return 'idle'
    if (index === question.correctIndex) return 'correct'
    if (index === selectedIndex) return 'wrong'
    return 'muted'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl leading-snug">{question.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          {question.options.map((option, index) => (
            <AnswerOption
              key={option.originalIndex}
              text={option.text}
              state={stateFor(index)}
              disabled={answered}
              onSelect={() => onAnswer(index)}
            />
          ))}
        </div>

        {answered || learnMode ? (
          <Feedback
            answered={answered}
            correct={selectedIndex === question.correctIndex}
            explanation={question.explanation}
          />
        ) : null}

        {answered ? (
          <div className="flex justify-end pt-1">
            <Button onClick={onNext}>
              {isLast ? (
                <>
                  <Flag className="size-4" />
                  See results
                </>
              ) : (
                <>
                  Next question
                  <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
