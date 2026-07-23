import type { Metadata } from 'next'

import { Dashboard } from '@/features/dashboard/dashboard'

export const metadata: Metadata = { title: 'Dashboard' }

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Your progress</h1>
      <Dashboard />
    </main>
  )
}
