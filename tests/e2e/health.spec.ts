import { test, expect } from '@playwright/test'

test('health endpoint should return healthy status', async ({ request }) => {
  const response = await request.get('/api/health')
  expect(response.ok()).toBeTruthy()

  const data = await response.json()
  expect(data.status).toBe('healthy')
  expect(data.service).toBe('greenworks-executive-dashboard')
})
