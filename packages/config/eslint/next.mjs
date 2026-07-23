import globals from 'globals'
import next from 'eslint-config-next'

import { baseConfig } from './base.mjs'

/**
 * Flat config for the Next.js App Router application.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nextConfig = [
  ...baseConfig,
  ...next,
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
]

export default nextConfig
