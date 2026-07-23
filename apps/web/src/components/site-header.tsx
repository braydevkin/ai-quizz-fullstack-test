'use client'

import { LogOut, Sparkles, UserRound } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { IdentityForm } from '@/features/identity/identity-form'
import { useUser } from '@/features/identity/user-context'

/**
 * App-wide header: brand + navigation on the left, theme and identity on the
 * right. Rendered once in the root layout so every page shares it.
 *
 * The sign-in form lives in a small disclosure rather than a dialog primitive —
 * keeping the dependency surface to the shadcn parts already in the tree.
 */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Sparkles className="text-primary size-5" />
          <span>AI Dev Quiz</span>
        </Link>

        <div className="flex items-center gap-2">
          <UserMenu />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function UserMenu() {
  const { user, status, signOut } = useUser()
  const [open, setOpen] = useState(false)

  if (status === 'loading') {
    return <div className="bg-muted h-8 w-20 animate-pulse rounded-md" aria-hidden />
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground hidden items-center gap-1.5 text-sm sm:flex">
          <UserRound className="size-4" />
          {user.name}
        </span>
        <Button variant="ghost" size="sm" onClick={signOut}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Sign out</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setOpen((value) => !value)}>
        Sign in
      </Button>

      {open ? (
        <>
          {/* Click-away layer. */}
          <button
            type="button"
            aria-label="Close sign in"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />
          <Card className="absolute right-0 z-20 mt-2 w-80 p-5 shadow-lg">
            <div className="space-y-1">
              <h2 className="font-semibold">Save your progress</h2>
              <p className="text-muted-foreground text-sm">
                Enter your name and email to track scores across sessions.
              </p>
            </div>
            <div className="mt-4">
              <IdentityForm onSuccess={() => setOpen(false)} />
            </div>
          </Card>
        </>
      ) : null}
    </div>
  )
}
