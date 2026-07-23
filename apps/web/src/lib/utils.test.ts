import { cn } from './utils'

describe('cn', () => {
  it('keeps non-conflicting classes', () => {
    expect(cn('flex', 'items-center')).toBe('flex items-center')
  })

  it('drops falsy values', () => {
    const isHidden = false

    expect(cn('flex', isHidden && 'hidden', undefined, 'gap-2')).toBe('flex gap-2')
  })

  it('lets the last of two conflicting Tailwind classes win', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })
})
