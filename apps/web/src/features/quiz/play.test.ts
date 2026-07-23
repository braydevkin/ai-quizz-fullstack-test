import type { Quiz } from '@quiz/shared'

import { buildQuestions, toAnswerInputs, type AnswerRecord } from './play'

const quiz: Quiz = {
  id: 'sample',
  title: 'Sample',
  description: 'A sample quiz',
  questions: [
    { id: 1, question: 'q1', options: ['a', 'b', 'c'], correctAnswer: 0, explanation: 'e1' },
    { id: 2, question: 'q2', options: ['c', 'd'], correctAnswer: 1, explanation: 'e2' },
  ],
}

describe('buildQuestions', () => {
  it('preserves order and locates the correct option when not randomising', () => {
    const built = buildQuestions(quiz, { randomize: false, learnMode: false })

    expect(built.map((q) => q.question)).toEqual(['q1', 'q2'])
    expect(built[0]!.correctIndex).toBe(0)
    expect(built[1]!.correctIndex).toBe(1)
    expect(built[0]!.options.map((o) => o.originalIndex)).toEqual([0, 1, 2])
  })

  it('keeps correctIndex pointing at the stored answer even after shuffling', () => {
    // Whatever the shuffle does, the option flagged correct must be the one the
    // quiz authored as correct.
    for (let run = 0; run < 20; run++) {
      const built = buildQuestions(quiz, { randomize: true, learnMode: false })

      built.forEach((question) => {
        const original = quiz.questions.find((q) => q.id === question.id)!
        expect(question.options[question.correctIndex]!.originalIndex).toBe(original.correctAnswer)
      })
    }
  })
})

describe('toAnswerInputs', () => {
  it('maps a displayed choice back to its original option index', () => {
    const questions = buildQuestions(quiz, { randomize: false, learnMode: false })
    const records: AnswerRecord[] = [
      { questionId: 1, selectedIndex: 2, correct: false },
      { questionId: 2, selectedIndex: 1, correct: true },
    ]

    expect(toAnswerInputs(questions, records)).toEqual([
      { questionId: 1, selectedAnswer: 2 },
      { questionId: 2, selectedAnswer: 1 },
    ])
  })
})
