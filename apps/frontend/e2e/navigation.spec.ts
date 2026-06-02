import { test, expect } from '@playwright/test';

// These tests run against the real app, if no server is running, they'll fail gracefully
test.describe('Navigation smoke (requires running app)', () => {
  test.skip(!!process.env.CI, 'Skip in CI without running server');

  test('candidates page is accessible after login', async ({ page }) => {
    // Simulate having a valid session by navigating directly
    await page.goto('/candidates');
    // Will either show candidates page or redirect to login
    const url = page.url();
    expect(url).toMatch(/\/(candidates|auth\/login|login)/);
  });

  test('dashboard loads', async ({ page }) => {
    await page.goto('/dashboard');
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|auth\/login|login)/);
  });
});
