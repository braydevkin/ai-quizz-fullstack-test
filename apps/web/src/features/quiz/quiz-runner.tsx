'use client'

import type { Quiz } from '@quiz/shared'

import { ProgressIndicator } from '@/features/quiz/progress-indicator'
import { QuestionCard } from '@/features/quiz/question-card'
import { Results } from '@/features/quiz/results'
import { StartScreen } from '@/features/quiz/start-screen'
import { useQuizRunner } from '@/features/quiz/use-quiz-runner'

/**
 * Drives one quiz through its three phases — start screen, question-by-question
 * play, then results — off the `useQuizRunner` state machine.
 */
export function QuizRunner({ quiz }: { quiz: Quiz }) {
  const runner = useQuizRunner(quiz)

  if (runner.phase === 'idle') {
    return <StartScreen quiz={quiz} onStart={runner.start} />
  }

  if (runner.phase === 'finished') {
    return (
      <Results
        quizId={quiz.id}
        score={runner.score}
        total={runner.total}
        percentage={runner.percentage}
        learnMode={runner.config.learnMode}
        questions={runner.questions}
        records={runner.records}
        answerInputs={runner.answerInputs}
        onRetake={runner.restart}
      />
    )
  }

  return (
    <div className="space-y-6">
      <ProgressIndicator current={runner.questionNumber} total={runner.total} />
      {runner.current ? (
        <QuestionCard
          question={runner.current}
          selectedIndex={runner.selectedIndex}
          answered={runner.answered}
          learnMode={runner.config.learnMode}
          isLast={runner.isLastQuestion}
          onAnswer={runner.answer}
          onNext={runner.next}
        />
      ) : null}
    </div>
  )
}
