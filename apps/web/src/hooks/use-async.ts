'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Run an async function once on mount and track its outcome.
 *
 * A small stand-in for a data-fetching library: enough for the read-only pages
 * that load a quiz or the catalogue. The function is captured in a ref so a new
 * closure each render doesn't re-fire it, and state is only ever set inside the
 * promise callbacks — never synchronously in the effect.
 */
export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: boolean
}

export function useAsync<T>(fn: () => Promise<T>): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: null, loading: true, error: false })
  const fnRef = useRef(fn)

  useEffect(() => {
    let active = true

    fnRef
      .current()
      .then((data) => {
        if (active) setState({ data, loading: false, error: false })
      })
      .catch(() => {
        if (active) setState({ data: null, loading: false, error: true })
      })

    return () => {
      active = false
    }
  }, [])

  return state
}
