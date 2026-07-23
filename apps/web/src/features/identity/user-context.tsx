'use client'

import type { User } from '@quiz/shared'
import { createContext, use, useCallback, useEffect, useState, type ReactNode } from 'react'

import { getItem, removeItem, setItem } from '@/lib/storage'
import { getUser, identify as identifyRequest } from '@/services/user.service'

/**
 * Lightweight, passwordless identity kept in React context.
 *
 * The current user's id is the only thing persisted (in `localStorage` under
 * `STORAGE_KEY`); on mount it is exchanged for the full user via the API, so a
 * renamed or deleted account can't linger client-side. There is no token and no
 * session — "signed in" means "we remember which user this browser is".
 */

const STORAGE_KEY = 'quiz.user'

/** `loading` covers the initial rehydrate so the UI can avoid a flash. */
type Status = 'loading' | 'anonymous' | 'authenticated'

interface UserContextValue {
  user: User | null
  status: Status
  identify: (name: string, email: string) => Promise<User>
  signOut: () => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<Status>('loading')

  useEffect(() => {
    let active = true

    // Initial status stays 'loading' (matching the server render); the resolve
    // happens in a promise callback so no state is set synchronously in the
    // effect body. No remembered id resolves straight to anonymous.
    const storedId = getItem<string>(STORAGE_KEY)
    const restore = storedId ? getUser(storedId) : Promise.resolve(null)

    restore
      .then((restored) => {
        if (!active) return
        if (restored) {
          setUser(restored)
          setStatus('authenticated')
        } else {
          setStatus('anonymous')
        }
      })
      .catch(() => {
        // The id no longer resolves (deleted user, wiped database) — forget it.
        if (!active) return
        removeItem(STORAGE_KEY)
        setStatus('anonymous')
      })

    return () => {
      active = false
    }
  }, [])

  const identify = useCallback(async (name: string, email: string) => {
    const identified = await identifyRequest({ name, email })

    setItem(STORAGE_KEY, identified.id)
    setUser(identified)
    setStatus('authenticated')

    return identified
  }, [])

  const signOut = useCallback(() => {
    removeItem(STORAGE_KEY)
    setUser(null)
    setStatus('anonymous')
  }, [])

  return <UserContext value={{ user, status, identify, signOut }}>{children}</UserContext>
}

export function useUser(): UserContextValue {
  const value = use(UserContext)

  if (!value) throw new Error('useUser must be used within a UserProvider')

  return value
}
