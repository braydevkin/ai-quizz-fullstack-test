import type { CreateQuizInput, Quiz } from '@quiz/shared'
import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import type { Kysely } from 'kysely'

import type { Database } from '../../db/schema.js'
import { HttpError } from '../../utils/http-error.js'
import { assignQuestionIds, createQuizService, type QuizStore } from './quiz.service.js'

/** The service never touches the instance — it only threads it to the store. */
const db = {} as Kysely<Database>

const question = (question: string) => ({
  question,
  options: ['a', 'b'],
  correctAnswer: 0,
  explanation: 'because',
})

const quiz: Quiz = {
  id: 'agent-fundamentals',
  title: 'Agent Fundamentals',
  description: 'Test your knowledge of AI agent design',
  questions: [{ id: 1, ...question('first') }],
}

const createInput: CreateQuizInput = {
  title: 'Agent Fundamentals',
  description: 'Test your knowledge of AI agent design',
  questions: [question('first')],
}

let store: QuizStore

beforeEach(() => {
  store = {
    listSummaries: jest.fn<QuizStore['listSummaries']>(),
    findById: jest.fn<QuizStore['findById']>(),
    insert: jest.fn<QuizStore['insert']>(),
    update: jest.fn<QuizStore['update']>(),
    remove: jest.fn<QuizStore['remove']>(),
  }
})

const service = () => createQuizService(db, store)

/** Asserts the rejection is an `HttpError` carrying `status`. */
async function expectStatus(promise: Promise<unknown>, status: number): Promise<void> {
  await expect(promise).rejects.toThrow(HttpError)
  await expect(promise).rejects.toMatchObject({ status })
}

describe('assignQuestionIds', () => {
  it('numbers questions from 1 when none carry an id', () => {
    const assigned = assignQuestionIds([question('a'), question('b'), question('c')])

    expect(assigned.map((q) => q.id)).toEqual([1, 2, 3])
  })

  it('keeps the ids authored content brings', () => {
    const assigned = assignQuestionIds([
      { id: 10, ...question('a') },
      { id: 20, ...question('b') },
    ])

    expect(assigned.map((q) => q.id)).toEqual([10, 20])
  })

  it('fills gaps with the lowest free ids when only some are given', () => {
    const assigned = assignQuestionIds([
      question('a'),
      { id: 1, ...question('b') },
      question('c'),
      { id: 3, ...question('d') },
    ])

    expect(assigned.map((q) => q.id)).toEqual([2, 1, 4, 3])
  })

  it('never repeats an id inside a quiz', () => {
    const assigned = assignQuestionIds([{ id: 2, ...question('a') }, question('b'), question('c')])

    expect(new Set(assigned.map((q) => q.id)).size).toBe(assigned.length)
  })
})

describe('get', () => {
  it('returns the stored quiz', async () => {
    jest.mocked(store.findById).mockResolvedValue(quiz)

    await expect(service().get('agent-fundamentals')).resolves.toEqual(quiz)
  })

  it('404s when there is no such quiz', async () => {
    jest.mocked(store.findById).mockResolvedValue(null)

    await expectStatus(service().get('nope'), 404)
  })
})

describe('create', () => {
  it('derives the id from the title and numbers the questions', async () => {
    jest.mocked(store.insert).mockImplementation(async (_db, created) => created)

    await service().create(createInput)

    expect(store.insert).toHaveBeenCalledWith(
      db,
      expect.objectContaining({
        id: 'agent-fundamentals',
        questions: [expect.objectContaining({ id: 1 })],
      }),
    )
  })

  it('prefers an explicit id over the derived one', async () => {
    jest.mocked(store.insert).mockImplementation(async (_db, created) => created)

    const created = await service().create({ ...createInput, id: 'custom-slug' })

    expect(created.id).toBe('custom-slug')
  })

  it('409s when the id is already taken', async () => {
    jest.mocked(store.insert).mockResolvedValue(null)

    await expectStatus(service().create(createInput), 409)
  })

  it('400s when the title yields no usable slug', async () => {
    await expectStatus(service().create({ ...createInput, title: '!!!' }), 400)
    expect(store.insert).not.toHaveBeenCalled()
  })
})

describe('replace', () => {
  it('sends every field, so the update is a full overwrite', async () => {
    jest.mocked(store.update).mockResolvedValue(quiz)

    await service().replace('agent-fundamentals', {
      title: 'New title',
      description: 'New description',
      questions: [question('only')],
    })

    expect(store.update).toHaveBeenCalledWith(db, 'agent-fundamentals', {
      title: 'New title',
      description: 'New description',
      questions: [expect.objectContaining({ id: 1 })],
    })
  })

  it('404s when there is no such quiz', async () => {
    jest.mocked(store.update).mockResolvedValue(null)

    await expectStatus(
      service().replace('nope', {
        title: 'New title',
        description: 'New description',
        questions: [question('only')],
      }),
      404,
    )
  })
})

describe('patch', () => {
  it('leaves untouched fields undefined so the repository skips them', async () => {
    jest.mocked(store.update).mockResolvedValue(quiz)

    await service().patch('agent-fundamentals', { title: 'New title' })

    expect(store.update).toHaveBeenCalledWith(db, 'agent-fundamentals', {
      title: 'New title',
      description: undefined,
      questions: undefined,
    })
  })

  it('numbers the questions when the patch replaces the set', async () => {
    jest.mocked(store.update).mockResolvedValue(quiz)

    await service().patch('agent-fundamentals', { questions: [question('a'), question('b')] })

    expect(store.update).toHaveBeenCalledWith(
      db,
      'agent-fundamentals',
      expect.objectContaining({
        questions: [expect.objectContaining({ id: 1 }), expect.objectContaining({ id: 2 })],
      }),
    )
  })

  it('404s when there is no such quiz', async () => {
    jest.mocked(store.update).mockResolvedValue(null)

    await expectStatus(service().patch('nope', { title: 'New title' }), 404)
  })
})

describe('remove', () => {
  it('resolves when a row was deleted', async () => {
    jest.mocked(store.remove).mockResolvedValue(1)

    await expect(service().remove('agent-fundamentals')).resolves.toBeUndefined()
  })

  it('404s when nothing was deleted', async () => {
    jest.mocked(store.remove).mockResolvedValue(0)

    await expectStatus(service().remove('nope'), 404)
  })
})

describe('list', () => {
  it('delegates straight to the store', async () => {
    const summaries = [{ id: 'agent-fundamentals', title: 'A', description: 'B', questionCount: 5 }]
    jest.mocked(store.listSummaries).mockResolvedValue(summaries)

    await expect(service().list()).resolves.toEqual(summaries)
  })
})
