'use client'

import type { Quiz } from '@quiz/shared'
import { ListChecks, Play, Shuffle, Sparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { RunConfig } from '@/features/quiz/play'

/** Pre-run screen: describe the quiz and let the player pick run options. */
export function StartScreen({
  quiz,
  onStart,
}: {
  quiz: Quiz
  onStart: (config: RunConfig) => void
}) {
  const [randomize, setRandomize] = useState(false)
  const [learnMode, setLearnMode] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{quiz.title}</CardTitle>
        <CardDescription>{quiz.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
          <ListChecks className="size-4" />
          {quiz.questions.length} {quiz.questions.length === 1 ? 'question' : 'questions'}
        </p>

        <div className="space-y-4">
          <ToggleRow
            icon={<Shuffle className="size-4" />}
            id="randomize"
            title="Randomize order"
            description="Shuffle the questions and answers for a fresh run."
            checked={randomize}
            onChange={setRandomize}
          />
          <ToggleRow
            icon={<Sparkles className="size-4" />}
            id="learn-mode"
            title="Learn Mode"
            description="See the explanation before you answer. This run isn't scored."
            checked={learnMode}
            onChange={setLearnMode}
          />
        </div>

        <Button size="lg" className="w-full" onClick={() => onStart({ randomize, learnMode })}>
          <Play className="size-4" />
          Start quiz
        </Button>
      </CardContent>
    </Card>
  )
}

function ToggleRow({
  icon,
  id,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  id: string
  title: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="cursor-pointer">
          {icon}
          {title}
        </Label>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
