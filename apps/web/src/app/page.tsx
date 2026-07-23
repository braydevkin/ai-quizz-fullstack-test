import { GraduationCap } from 'lucide-react'

import { Catalog } from '@/features/catalog/catalog'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <section className="mx-auto max-w-2xl space-y-4 text-center">
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <GraduationCap className="size-3.5" />
          AI development quizzes
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          Test your AI development knowledge
        </h1>
        <p className="text-muted-foreground text-pretty">
          Pick a topic and work through multiple-choice questions with instant feedback and an
          explanation for every answer. Sign in to track your scores over time.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-lg font-semibold">Choose a quiz</h2>
        <Catalog />
      </section>
    </main>
  )
}
