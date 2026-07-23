import { expect, test } from '@playwright/test'

test.describe('home page', () => {
  test('renders the landing hero', async ({ page }) => {
    await page.route('**/quizzes', (route) => route.fulfill({ json: [] }))

    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Test your AI development knowledge' }),
    ).toBeVisible()
  })

  test('lists the quiz catalogue and links into a quiz', async ({ page }) => {
    await page.route('**/quizzes', (route) =>
      route.fulfill({
        json: [{ id: 'demo', title: 'Demo Quiz', description: 'A short demo', questionCount: 2 }],
      }),
    )

    await page.goto('/')

    await expect(page.getByText('Demo Quiz')).toBeVisible()
    await expect(page.getByRole('link', { name: /Start quiz/ })).toHaveAttribute(
      'href',
      '/quiz/demo',
    )
  })
})
