import { QUIZ_ID_PATTERN } from '@quiz/shared'
import { describe, expect, it } from '@jest/globals'

import { slugify } from './slug.js'

describe('slugify', () => {
  it('lowercases and joins words with a single dash', () => {
    expect(slugify('Agent Fundamentals')).toBe('agent-fundamentals')
  })

  it('folds accents down to ascii', () => {
    expect(slugify('Ingeniería de Prompts')).toBe('ingenieria-de-prompts')
  })

  it('collapses runs of punctuation and whitespace', () => {
    expect(slugify('Model  Selection — 101!!')).toBe('model-selection-101')
  })

  it('trims leading and trailing separators', () => {
    expect(slugify('  ...Prompt Engineering...  ')).toBe('prompt-engineering')
  })

  it('leaves an already valid slug untouched', () => {
    expect(slugify('agent-fundamentals')).toBe('agent-fundamentals')
  })

  it('produces ids the shared pattern accepts', () => {
    for (const title of [
      'Agent Fundamentals',
      'Ingeniería de Prompts',
      'Model  Selection — 101!!',
    ]) {
      expect(slugify(title)).toMatch(QUIZ_ID_PATTERN)
    }
  })

  it('returns an empty string when nothing survives, rather than a bare dash', () => {
    expect(slugify('!!! ---')).toBe('')
  })
})
