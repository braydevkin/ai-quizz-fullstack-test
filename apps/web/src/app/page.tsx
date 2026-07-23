import { Sparkles } from 'lucide-react'

import { ApiStatus } from '@/components/api-status'

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium">
          <Sparkles className="size-3.5" />
          Infrastructure phase
        </span>
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight text-balance">
          AI Development Quiz App
        </h1>
        <p className="text-muted-foreground text-pretty">
          The monorepo is up and running. Frontend, API, shared packages and tooling are wired
          together — quiz features land on top of this base.
        </p>
      </div>

      <ApiStatus />
    </main>
  )
}
