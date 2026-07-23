/**
 * Small presentation helpers shared across features.
 */

/** Format an ISO timestamp as a short, locale-aware date and time. */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}
