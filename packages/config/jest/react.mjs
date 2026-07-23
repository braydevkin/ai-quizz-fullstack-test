import { baseConfig } from './base.mjs'

/**
 * Jest configuration for the Next.js workspace, meant to be passed through
 * `next/jest` — that wrapper supplies the SWC transform, CSS/asset stubs and
 * the `@/*` module mapping read from `tsconfig.json`, so none of it is
 * repeated here.
 *
 * @param {import('jest').Config} [overrides]
 * @returns {import('jest').Config}
 */
export function createReactConfig(overrides = {}) {
  return {
    ...baseConfig,
    testEnvironment: 'jsdom',
    ...overrides,
  }
}

export default createReactConfig
