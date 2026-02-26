import { test } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

// NOTE: This E2E spec expects the dev API server on :3000 and Next.js on :3001.

test.describe('E2E: drafts flow', () => {
  test('new idea -> save draft -> My Drafts -> resume -> submit', async ({ page }) => {
    const email = `drafts+${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register
    await page.goto(`${BASE}/register`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Create account")');
    await page.waitForTimeout(500);

    // Login
    await page.goto(`${BASE}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button:has-text("Sign in")');
    await page.waitForTimeout(500);

    // Go to New Idea page
    await page.goto(`${BASE}/ideas/new`);
    await page.fill('input[name="title"]', 'Drafted idea');
    await page.fill('textarea[name="description"]', 'Draft description');

    // Save draft
    await page.click('button:has-text("Save draft")');
    await page.waitForTimeout(500);

    // Go to My Drafts page
    await page.goto(`${BASE}/ideas/drafts`);
    await page.waitForTimeout(500);

    // Resume first draft
    await page.click('button:has-text("Resume")');
    await page.waitForTimeout(500);

    // Submit from draft
    await page.click('button:has-text("Submit now")');
    await page.waitForTimeout(500);
  });
});
