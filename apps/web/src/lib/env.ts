import { z } from 'zod'

/**
 * Public (browser-exposed) configuration.
 *
 * `process.env.NEXT_PUBLIC_*` must be referenced statically so Next.js can
 * inline the value at build time — hence the explicit object below.
 */
const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.url().default('http://localhost:3333'),
})

export const env = publicEnvSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
})
