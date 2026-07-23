import type { AnswerInput, Quiz } from '@quiz/shared'

import { shuffle } from '@/features/quiz/shuffle'

/**
 * The in-memory model a quiz is played through.
 *
 * A quiz's stored `correctAnswer` indexes its *original* option order. When
 * options are shuffled for display, `correctIndex` tracks where that answer
 * moved to, and each option keeps its `originalIndex` so a submission can be
 * translated back to what the API grades against.
 */

export interface PlayOption {
  text: string
  /** Index of this option in the quiz's stored order. */
  originalIndex: number
}

export interface PlayQuestion {
  id: number
  question: string
  options: PlayOption[]
  /** Index into `options` (as displayed) that is the correct choice. */
  correctIndex: number
  explanation: string
}

export interface RunConfig {
  /** Shuffle question and option order for a fresh run each time. */
  randomize: boolean
  /** Reveal the explanation before answering; the run isn't scored/saved. */
  learnMode: boolean
}

export interface AnswerRecord {
  questionId: number
  /** Index into the displayed options the user chose. */
  selectedIndex: number
  correct: boolean
}

/** Build the playable questions for a run, applying randomisation if requested. */
export function buildQuestions(quiz: Quiz, config: RunConfig): PlayQuestion[] {
  const ordered = config.randomize ? shuffle(quiz.questions) : quiz.questions

  return ordered.map((question) => {
    const options: PlayOption[] = question.options.map((text, originalIndex) => ({
      text,
      originalIndex,
    }))
    const displayed = config.randomize ? shuffle(options) : options

    return {
      id: question.id,
      question: question.question,
      options: displayed,
      correctIndex: displayed.findIndex(
        (option) => option.originalIndex === question.correctAnswer,
      ),
      explanation: question.explanation,
    }
  })
}

/**
 * Translate the recorded answers into the API's submit shape, mapping each
 * displayed choice back to its original option index.
 */
export function toAnswerInputs(questions: PlayQuestion[], records: AnswerRecord[]): AnswerInput[] {
  return records.map((record) => {
    const question = questions.find((candidate) => candidate.id === record.questionId)
    const originalIndex =
      question?.options[record.selectedIndex]?.originalIndex ?? record.selectedIndex

    return { questionId: record.questionId, selectedAnswer: originalIndex }
  })
}
