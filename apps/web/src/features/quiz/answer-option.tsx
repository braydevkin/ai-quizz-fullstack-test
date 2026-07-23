'use client'

import { Check, X } from 'lucide-react'

import { cn } from '@/lib/utils'

/** How an option should look given the current answer state. */
export type OptionState = 'idle' | 'correct' | 'wrong' | 'muted'

const stateStyles: Record<OptionState, string> = {
  idle: 'hover:border-primary hover:bg-accent',
  correct: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  wrong: 'border-destructive bg-destructive/10 text-destructive',
  muted: 'opacity-60',
}

/** A single selectable answer. Locks (disabled) once the question is answered. */
export function AnswerOption({
  text,
  state,
  disabled,
  onSelect,
}: {
  text: string
  state: OptionState
  disabled: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-lg border p-4 text-left text-sm transition-colors',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        'disabled:cursor-default',
        stateStyles[state],
      )}
    >
      <span>{text}</span>
      {state === 'correct' ? <Check className="size-4 shrink-0" /> : null}
      {state === 'wrong' ? <X className="size-4 shrink-0" /> : null}
    </button>
  )
}
