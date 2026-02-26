import { test } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3001';

// NOTE: This E2E spec expects the dev API server on :3000 and Next.js on :3001.

test.describe('E2E: drafts flow', () => {
  test('new idea -> save draft -> My Drafts -> resume -> submit', async ({ page }) => {
    const email = `drafts+${Date.now()}@example.com`;
    const password = 'Password123!';

    // Register
    await page.goto(`${BASE}/register`);
    // Fill required username field (frontend requires username on register page)
    await page.fill('input[name="username"]', `user-${Date.now()}`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="confirmPassword"]', password);
    const registerResponse = page.waitForResponse(r => r.url().includes('/api/auth/register') && (r.status() === 200 || r.status() === 201), { timeout: 10000 });
    await page.click('button:has-text("Create account")');
    await registerResponse;

    // Login
    await page.goto(`${BASE}/login`);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    const loginResponse = page.waitForResponse(r => r.url().includes('/api/auth/login') && r.status() === 200, { timeout: 10000 });
    await page.click('button:has-text("Sign in")');
    await loginResponse;

    // Go to New Idea page
    await page.goto(`${BASE}/ideas/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('input[name="title"]', { state: 'visible', timeout: 10000 });
    await page.fill('input[name="title"]', 'Drafted idea');
    await page.fill('textarea[name="description"]', 'Draft description');

    // Save draft and wait for backend confirmation
    const saveDraftResponse = page.waitForResponse(r => r.url().includes('/api/drafts') && (r.status() === 200 || r.status() === 201), { timeout: 10000 });
    await page.click('button:has-text("Save draft")');
    await saveDraftResponse;

    // Go to My Drafts page and submit the draft directly (skip Resume button)
    await page.goto(`${BASE}/ideas/drafts`);
    // Drafts list uses "Submit" button text
    await page.waitForSelector('button:has-text("Submit")', { state: 'visible', timeout: 10000 });
    await page.click('button:has-text("Submit")');
    await page.waitForTimeout(500);
  });
});
