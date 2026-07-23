import { describe, expect, it, jest } from '@jest/globals'
import type { Request, Response } from 'express'

import { errorHandler, notFoundHandler } from './error.middleware.js'

/** Minimal `Response` double: only `status()` and `json()` are exercised. */
function createResponse() {
  const res = {
    status: jest.fn(() => res),
    json: jest.fn(() => res),
  }

  return res as unknown as Response & { status: jest.Mock; json: jest.Mock }
}

describe('notFoundHandler', () => {
  it('answers 404 with the unmatched method and url', () => {
    const req = { method: 'GET', originalUrl: '/quizzes' } as Request
    const res = createResponse()

    notFoundHandler(req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 404,
      error: 'Not Found',
      message: 'Route GET /quizzes not found',
    })
  })
})

describe('errorHandler', () => {
  it('uses the status carried by the error', () => {
    const error = Object.assign(new Error('nope'), { status: 400 })
    const req = { log: { error: jest.fn() } } as unknown as Request
    const res = createResponse()

    errorHandler(error, req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      statusCode: 400,
      error: 'Bad Request',
      message: 'nope',
    })
  })

  it('falls back to 500 when the error carries no status', () => {
    const req = { log: { error: jest.fn() } } as unknown as Request
    const res = createResponse()

    errorHandler(new Error('boom'), req, res, jest.fn())

    expect(res.status).toHaveBeenCalledWith(500)
  })

  it('passes the details of a client error through', () => {
    const details = [
      { path: 'title', message: 'Too small: expected string to have >=1 characters' },
    ]
    const error = Object.assign(new Error('Validation failed'), { status: 400, details })
    const req = { log: { error: jest.fn() } } as unknown as Request
    const res = createResponse()

    errorHandler(error, req, res, jest.fn())

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ details }))
  })

  it('withholds details on a server error, where they are internals', () => {
    const error = Object.assign(new Error('boom'), { status: 500, details: { query: 'select 1' } })
    const req = { log: { error: jest.fn() } } as unknown as Request
    const res = createResponse()

    errorHandler(error, req, res, jest.fn())

    expect(res.json).toHaveBeenCalledWith(
      expect.not.objectContaining({ details: expect.anything() }),
    )
  })
})
