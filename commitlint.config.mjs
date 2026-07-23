/**
 * Conventional Commits — enforced by the `commit-msg` Git hook.
 *
 * Examples:
 *   feat(web): add quiz results screen
 *   fix(api): return 400 on malformed payload
 *   chore(repo): bump turborepo
 */

/** @type {import('@commitlint/types').UserConfig} */
const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [1, 'always', ['api', 'web', 'shared', 'config', 'docker', 'repo', 'deps', 'ci']],
    'subject-case': [2, 'never', ['pascal-case', 'upper-case']],
    'header-max-length': [2, 'always', 100],
  },
}

export default config
