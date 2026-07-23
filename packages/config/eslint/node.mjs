import globals from 'globals'

import { baseConfig } from './base.mjs'

/**
 * Flat config for Node.js services and libraries.
 *
 * @type {import('eslint').Linter.Config[]}
 */
export const nodeConfig = [
  ...baseConfig,
  {
    languageOptions: {
      globals: { ...globals.node },
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
]

export default nodeConfig
