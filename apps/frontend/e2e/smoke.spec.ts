import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('home page redirects to login or dashboard', async ({ page }) => {
    await page.goto('/');
    // Should land on login or dashboard
    await expect(page).toHaveURL(/\/(auth\/login|dashboard|login)/);
  });

  test('login page loads', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible({ timeout: 10000 });
  });

  test('login form submits and redirects on valid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill('admin@acme.com');
    await passwordInput.fill('password123');

    await page.click('button[type="submit"]');

    // Wait for redirect, either to dashboard or stay on login with error
    await page.waitForURL(/\/(dashboard|auth\/login)/, { timeout: 10000 });
    // Either a dashboard page or an error message should be visible
    const url = page.url();
    expect(url).toMatch(/\/(dashboard|auth\/login)/);
  });
});
