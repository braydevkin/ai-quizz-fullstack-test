import { fileURLToPath } from 'node:url'

// Prettier resolves plugin names relative to the *consumer's* cwd, which in a
// pnpm workspace is not where this package's dependencies live — so resolve to
// an absolute path from here instead.
const tailwindPlugin = fileURLToPath(import.meta.resolve('prettier-plugin-tailwindcss'))

/**
 * Shared Prettier configuration.
 *
 * @type {import('prettier').Config}
 */
const config = {
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  bracketSpacing: true,
  endOfLine: 'lf',
  plugins: [tailwindPlugin],
}

export default config
