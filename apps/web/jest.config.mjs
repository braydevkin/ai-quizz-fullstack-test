import nextJest from 'next/jest.js'

import { createReactConfig } from '@quiz/config/jest/react'

/**
 * `next/jest` reads `next.config.ts` and wires the SWC transform, the `@/*`
 * alias from `tsconfig.json`, CSS/asset stubs and `.env` loading — so this file
 * only adds what is specific to component testing.
 *
 * Scope: unit tests colocated in `src`. Integration coverage of the running
 * app goes through Playwright, in `e2e/`.
 */
const createJestConfig = nextJest({ dir: './' })

export default createJestConfig(
  createReactConfig({
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    // `output: 'standalone'` copies package.json into .next/, which Jest's
    // module map then reads as a second copy of this workspace.
    modulePathIgnorePatterns: ['<rootDir>/.next/'],
  }),
)
