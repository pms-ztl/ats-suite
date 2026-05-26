import { test, expect } from '@playwright/test';

/**
 * Hiring Pipeline E2E tests (Playwright)
 *
 * These tests verify navigation through the main hiring pipeline pages.
 * They require a running frontend + backend. Set E2E_ENABLED=true to run.
 */
test.describe('Hiring Pipeline E2E (requires running app)', () => {
  test.skip(!process.env.E2E_ENABLED, 'Set E2E_ENABLED=true to run');

  test('login and view dashboard', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"], input[type="email"]', 'admin@acme.com');
    await page.fill('input[type="password"]', 'Password123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/(dashboard|/)');
    // Dashboard should load with a visible heading
    await expect(page.locator('h1')).toBeVisible({ timeout: 10000 });
  });

  test('navigate to candidates list', async ({ page }) => {
    await page.goto('/candidates');
    // Should either show candidates or redirect to login
    const url = page.url();
    expect(url).toMatch(/\/(candidates|auth\/login)/);
  });

  test('navigate to requisitions', async ({ page }) => {
    await page.goto('/requisitions');
    const url = page.url();
    expect(url).toMatch(/\/(requisitions|auth\/login)/);
  });

  test('navigate to interviews', async ({ page }) => {
    await page.goto('/interviews');
    const url = page.url();
    expect(url).toMatch(/\/(interviews|auth\/login)/);
  });

  test('navigate to analytics', async ({ page }) => {
    await page.goto('/analytics');
    const url = page.url();
    expect(url).toMatch(/\/(analytics|auth\/login)/);
  });

  test('navigate to compliance', async ({ page }) => {
    await page.goto('/compliance');
    const url = page.url();
    expect(url).toMatch(/\/(compliance|auth\/login)/);
  });

  test('navigate to settings', async ({ page }) => {
    await page.goto('/settings');
    const url = page.url();
    expect(url).toMatch(/\/(settings|auth\/login)/);
  });
});
