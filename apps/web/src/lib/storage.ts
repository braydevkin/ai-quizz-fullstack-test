/**
 * Safe `localStorage` access.
 *
 * Guards the server render (where `window` is undefined) and a browser that
 * refuses storage (private mode, disabled cookies), so a caller never has to
 * wrap reads and writes in try/catch. Values are stored as JSON.
 */

export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(key)

    return raw === null ? null : (JSON.parse(raw) as T)
  } catch {
    return null
  }
}

export function setItem(key: string, value: unknown): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable — identity simply won't be remembered.
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing to do — the key is effectively gone either way.
  }
}
