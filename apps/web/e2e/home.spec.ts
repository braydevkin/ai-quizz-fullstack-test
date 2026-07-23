import { expect, test } from '@playwright/test'

test.describe('home page', () => {
  test('renders the landing content', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'AI Development Quiz App' })).toBeVisible()
  })

  test('reports the API status once the check resolves', async ({ page }) => {
    await page.route('**/', async (route, request) => {
      if (request.url().includes(':3333')) {
        await route.fulfill({ json: { status: 'ok' } })
        return
      }

      await route.fallback()
    })

    await page.goto('/')

    await expect(page.getByText('API is up')).toBeVisible()
  })
})
