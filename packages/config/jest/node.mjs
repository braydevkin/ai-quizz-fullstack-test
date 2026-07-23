import { baseConfig } from './base.mjs'

/**
 * Jest configuration for the ESM + NodeNext workspaces (`apps/api`,
 * `packages/shared`).
 *
 * Two details make ESM work here:
 * - `useESM` + `extensionsToTreatAsEsm` so ts-jest emits real ES modules;
 *   the runner needs `NODE_OPTIONS=--experimental-vm-modules` to load them.
 * - the `moduleNameMapper` entry strips the `.js` extension our relative
 *   imports carry (`./lib/env.js`), which exists on disk only after a build.
 *
 * The consuming workspace must have `jest` and `ts-jest` installed — Jest
 * resolves transformers from its own `rootDir`, not from here.
 *
 * @param {import('jest').Config} [overrides]
 * @returns {import('jest').Config}
 */
export function createNodeConfig(overrides = {}) {
  return {
    ...baseConfig,
    testEnvironment: 'node',
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    transform: {
      '^.+\\.ts$': [
        'ts-jest',
        {
          useESM: true,
          tsconfig: '<rootDir>/tsconfig.test.json',
        },
      ],
    },
    ...overrides,
  }
}

export default createNodeConfig
