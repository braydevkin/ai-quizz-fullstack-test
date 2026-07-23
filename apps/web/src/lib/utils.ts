import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names while resolving conflicting Tailwind classes.
 * Required by every shadcn/ui component.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
