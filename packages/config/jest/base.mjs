/**
 * Options every Jest project in the monorepo shares.
 *
 * Kept transformer-agnostic on purpose: `jest/node.mjs` adds the ts-jest ESM
 * transform for Node workspaces, while `jest/react.mjs` is merged into the
 * config `next/jest` generates (Next.js owns the SWC transform there).
 *
 * @type {import('jest').Config}
 */
export const baseConfig = {
  // Unit tests live next to the code they cover. Playwright specs live in
  // `e2e/` and are deliberately outside this glob.
  testMatch: ['<rootDir>/src/**/*.test.{ts,tsx}'],

  clearMocks: true,
  restoreMocks: true,

  // A workspace without tests yet must not fail `turbo run test`.
  passWithNoTests: true,

  coverageDirectory: '<rootDir>/coverage',
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '<rootDir>/src/**/*.{ts,tsx}',
    '!<rootDir>/src/**/*.test.{ts,tsx}',
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/index.ts',
  ],
}

export default baseConfig
