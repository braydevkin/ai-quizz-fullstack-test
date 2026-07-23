'use client'

import { identifyUserSchema, type User } from '@quiz/shared'
import { useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/services/api-client'
import { useUser } from '@/features/identity/user-context'

/**
 * Name + email sign-in form.
 *
 * Validation reuses the shared `identifyUserSchema`, so the client rejects the
 * same payloads the API would. On success it hands back the identified user;
 * callers use that to close a dialog, save a pending score, and so on.
 */
export function IdentityForm({ onSuccess }: { onSuccess?: (user: User) => void }) {
  const { identify } = useUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const parsed = identifyUserSchema.safeParse({ name, email })

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Please check your details')
      return
    }

    setSubmitting(true)

    try {
      const user = await identify(parsed.data.name, parsed.data.email)
      onSuccess?.(user)
    } catch (cause) {
      setError(
        cause instanceof ApiError
          ? 'Could not reach the server — please try again'
          : 'Something went wrong — please try again',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="identity-name">Name</Label>
        <Input
          id="identity-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ada Lovelace"
          autoComplete="name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="identity-email">Email</Label>
        <Input
          id="identity-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="ada@example.com"
          autoComplete="email"
          required
        />
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? 'Saving…' : 'Continue'}
      </Button>

      <p className="text-muted-foreground text-xs">
        No password needed — your email just lets us save your scores.
      </p>
    </form>
  )
}
