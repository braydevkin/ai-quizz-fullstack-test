/**
 * Turn a title into a kebab-case slug (`Agent Fundamentals` →
 * `agent-fundamentals`), used to derive a quiz id when the payload omits one.
 *
 * Kept API-local rather than in `@quiz/shared`: nothing on the web side needs
 * it yet. Move it there — with its tests — the moment a form wants to preview
 * the slug it is about to create.
 *
 * The output satisfies `QUIZ_ID_PATTERN`, except for the empty string, which a
 * title made up entirely of punctuation produces. Callers decide what that
 * means; `quizSchema` rejects it.
 */
export function slugify(value: string): string {
  return (
    value
      .normalize('NFKD')
      // Strip the combining marks NFKD just split off, so `é` becomes `e`.
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}
