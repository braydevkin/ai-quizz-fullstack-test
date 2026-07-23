'use client'

import type { AnswerInput, Quiz } from '@quiz/shared'
import { useCallback, useMemo, useState } from 'react'

import {
  buildQuestions,
  toAnswerInputs,
  type AnswerRecord,
  type PlayQuestion,
  type RunConfig,
} from '@/features/quiz/play'

/**
 * The quiz-taking state machine.
 *
 * `idle` shows the start screen (topic + Randomize / Learn Mode toggles),
 * `playing` walks the questions one at a time with immediate feedback, and
 * `finished` hands off to the results screen. Answering a question locks it in
 * and reveals whether it was right — that immediacy is the whole point.
 */

export type RunPhase = 'idle' | 'playing' | 'finished'

interface RunState {
  phase: RunPhase
  config: RunConfig
  questions: PlayQuestion[]
  index: number
  selectedIndex: number | null
  answered: boolean
  records: AnswerRecord[]
}

const INITIAL: RunState = {
  phase: 'idle',
  config: { randomize: false, learnMode: false },
  questions: [],
  index: 0,
  selectedIndex: null,
  answered: false,
  records: [],
}

export interface QuizRunner {
  phase: RunPhase
  config: RunConfig
  /** The question on screen, or null before the run starts / after it ends. */
  current: PlayQuestion | null
  questionNumber: number
  total: number
  selectedIndex: number | null
  answered: boolean
  score: number
  percentage: number
  isLastQuestion: boolean
  /** Every question of the run, for the results review. */
  questions: PlayQuestion[]
  records: AnswerRecord[]
  /** Recorded answers in the API's submit shape. */
  answerInputs: AnswerInput[]
  start: (config: RunConfig) => void
  answer: (optionIndex: number) => void
  next: () => void
  restart: () => void
}

export function useQuizRunner(quiz: Quiz): QuizRunner {
  const [state, setState] = useState<RunState>(INITIAL)

  const begin = useCallback(
    (config: RunConfig) => {
      setState({
        phase: 'playing',
        config,
        questions: buildQuestions(quiz, config),
        index: 0,
        selectedIndex: null,
        answered: false,
        records: [],
      })
    },
    [quiz],
  )

  const answer = useCallback((optionIndex: number) => {
    setState((prev) => {
      const question = prev.questions[prev.index]

      if (prev.phase !== 'playing' || prev.answered || !question) return prev

      const record: AnswerRecord = {
        questionId: question.id,
        selectedIndex: optionIndex,
        correct: optionIndex === question.correctIndex,
      }

      return {
        ...prev,
        selectedIndex: optionIndex,
        answered: true,
        records: [...prev.records, record],
      }
    })
  }, [])

  const next = useCallback(() => {
    setState((prev) => {
      if (prev.phase !== 'playing' || !prev.answered) return prev

      const isLast = prev.index >= prev.questions.length - 1

      if (isLast) return { ...prev, phase: 'finished' }

      return { ...prev, index: prev.index + 1, selectedIndex: null, answered: false }
    })
  }, [])

  const restart = useCallback(() => {
    setState((prev) => ({
      phase: 'playing',
      config: prev.config,
      questions: buildQuestions(quiz, prev.config),
      index: 0,
      selectedIndex: null,
      answered: false,
      records: [],
    }))
  }, [quiz])

  const score = state.records.filter((record) => record.correct).length
  const total = state.questions.length
  const answerInputs = useMemo(
    () => toAnswerInputs(state.questions, state.records),
    [state.questions, state.records],
  )

  return {
    phase: state.phase,
    config: state.config,
    current: state.questions[state.index] ?? null,
    questionNumber: state.index + 1,
    total,
    selectedIndex: state.selectedIndex,
    answered: state.answered,
    score,
    percentage: total === 0 ? 0 : Math.round((score / total) * 100),
    isLastQuestion: state.index >= total - 1,
    questions: state.questions,
    records: state.records,
    answerInputs,
    start: begin,
    answer,
    next,
    restart,
  }
}
