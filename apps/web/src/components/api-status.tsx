'use client'

import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

import { env } from '@/lib/env'
import { apiFetch } from '@/services/api-client'
import { cn } from '@/lib/utils'

type Status = 'loading' | 'ok' | 'unreachable'

/**
 * Infrastructure smoke test: confirms the browser can reach `GET /` on the API.
 */
export function ApiStatus() {
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let active = true

    apiFetch<{ status: string }>('/')
      .then((data) => active && setStatus(data.status === 'ok' ? 'ok' : 'unreachable'))
      .catch(() => active && setStatus('unreachable'))

    return () => {
      active = false
    }
  }, [])

  const { Icon, label, tone } = {
    loading: { Icon: LoaderCircle, label: 'Checking API…', tone: 'text-muted-foreground' },
    ok: { Icon: CircleCheck, label: 'API is up', tone: 'text-emerald-600 dark:text-emerald-400' },
    unreachable: { Icon: CircleAlert, label: 'API unreachable', tone: 'text-destructive' },
  }[status]

  return (
    <div className="bg-card flex items-center gap-3 rounded-lg border px-4 py-3 text-sm">
      <Icon className={cn('size-4', tone, status === 'loading' && 'animate-spin')} />
      <span className="font-medium">{label}</span>
      <code className="text-muted-foreground font-mono text-xs">{env.NEXT_PUBLIC_API_URL}</code>
    </div>
  )
}
