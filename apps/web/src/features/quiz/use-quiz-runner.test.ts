import type { Quiz } from '@quiz/shared'
import { act, renderHook } from '@testing-library/react'

import { useQuizRunner } from './use-quiz-runner'

const quiz: Quiz = {
  id: 'sample',
  title: 'Sample',
  description: 'A sample quiz',
  questions: [
    { id: 1, question: 'q1', options: ['a', 'b'], correctAnswer: 0, explanation: 'e1' },
    { id: 2, question: 'q2', options: ['c', 'd'], correctAnswer: 1, explanation: 'e2' },
  ],
}

const config = { randomize: false, learnMode: false }

it('starts idle and moves to playing on start', () => {
  const { result } = renderHook(() => useQuizRunner(quiz))

  expect(result.current.phase).toBe('idle')

  act(() => result.current.start(config))

  expect(result.current.phase).toBe('playing')
  expect(result.current.current?.question).toBe('q1')
  expect(result.current.total).toBe(2)
  expect(result.current.questionNumber).toBe(1)
})

it('scores correct answers and reveals feedback', () => {
  const { result } = renderHook(() => useQuizRunner(quiz))
  act(() => result.current.start(config))

  act(() => result.current.answer(0)) // correct for q1

  expect(result.current.answered).toBe(true)
  expect(result.current.selectedIndex).toBe(0)
  expect(result.current.score).toBe(1)
})

it('ignores a second answer on the same question', () => {
  const { result } = renderHook(() => useQuizRunner(quiz))
  act(() => result.current.start(config))

  act(() => result.current.answer(0)) // correct
  act(() => result.current.answer(1)) // must be ignored

  expect(result.current.selectedIndex).toBe(0)
  expect(result.current.score).toBe(1)
})

it('walks to the end and computes the percentage', () => {
  const { result } = renderHook(() => useQuizRunner(quiz))
  act(() => result.current.start(config))

  act(() => result.current.answer(0)) // q1 correct
  act(() => result.current.next())

  expect(result.current.questionNumber).toBe(2)
  expect(result.current.isLastQuestion).toBe(true)

  act(() => result.current.answer(0)) // q2 wrong (correct is 1)
  act(() => result.current.next())

  expect(result.current.phase).toBe('finished')
  expect(result.current.score).toBe(1)
  expect(result.current.percentage).toBe(50)
  expect(result.current.answerInputs).toEqual([
    { questionId: 1, selectedAnswer: 0 },
    { questionId: 2, selectedAnswer: 0 },
  ])
})

it('replays a fresh run on restart', () => {
  const { result } = renderHook(() => useQuizRunner(quiz))
  act(() => result.current.start(config))
  act(() => result.current.answer(0))

  act(() => result.current.restart())

  expect(result.current.phase).toBe('playing')
  expect(result.current.questionNumber).toBe(1)
  expect(result.current.answered).toBe(false)
  expect(result.current.score).toBe(0)
})
