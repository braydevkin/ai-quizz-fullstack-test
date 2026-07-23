import { createNodeConfig } from '@quiz/config/jest/node'

/**
 * Unit tests only — the API is covered by isolated tests around services,
 * repositories, middleware and utils. End-to-end coverage of the running
 * stack lives in the web workspace (Playwright).
 *
 * @type {import('jest').Config}
 */
export default createNodeConfig({
  setupFiles: ['<rootDir>/jest.setup.ts'],
})
