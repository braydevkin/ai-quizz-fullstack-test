import { expect, test } from '@playwright/test'

/**
 * The quiz-taking happy path, with the API stubbed so the spec needs only the
 * web dev server. An anonymous run reaches the results screen; saving is
 * covered by the unit tests, which don't need a browser.
 */
const quiz = {
  id: 'demo',
  title: 'Demo Quiz',
  description: 'A short demo quiz',
  questions: [
    {
      id: 1,
      question: 'What is 2 + 2?',
      options: ['3', '4'],
      correctAnswer: 1,
      explanation: 'Two plus two is four.',
    },
    {
      id: 2,
      question: 'Capital of France?',
      options: ['Paris', 'Rome'],
      correctAnswer: 0,
      explanation: 'Paris is the capital of France.',
    },
  ],
}

test('plays a quiz from start screen through to results', async ({ page }) => {
  await page.route('**/quizzes/demo', (route) => route.fulfill({ json: quiz }))

  await page.goto('/quiz/demo')

  // Start screen → begin the run.
  await expect(page.getByRole('heading', { name: 'Demo Quiz' })).toBeVisible()
  await page.getByRole('button', { name: 'Start quiz' }).click()

  // Question 1 — answer correctly and see immediate feedback.
  await expect(page.getByText('Question 1 of 2')).toBeVisible()
  await page.getByRole('button', { name: '4', exact: true }).click()
  await expect(page.getByText('Correct')).toBeVisible()
  await page.getByRole('button', { name: /Next question/ }).click()

  // Question 2 — answer, then finish.
  await expect(page.getByText('Question 2 of 2')).toBeVisible()
  await page.getByRole('button', { name: 'Paris', exact: true }).click()
  await page.getByRole('button', { name: /See results/ }).click()

  // Results.
  await expect(page.getByText('100%')).toBeVisible()
  await expect(page.getByText('Excellent')).toBeVisible()
})
