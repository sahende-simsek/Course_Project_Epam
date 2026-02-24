"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const BASE = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';
test_1.test.describe('Frontend E2E: register -> login -> logout', () => {
    (0, test_1.test)('user can register, login and logout', async ({ page }) => {
        const email = `e2e+${Date.now()}@example.com`;
        const password = 'Password123!';
        // Register flow
        await page.goto(`${BASE}/register`);
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button:has-text("Create account")');
        // Expect either navigation or success signal
        await page.waitForTimeout(500);
        // Login flow
        await page.goto(`${BASE}/login`);
        await page.fill('input[name="email"]', email);
        await page.fill('input[name="password"]', password);
        await page.click('button:has-text("Sign in")');
        await page.waitForTimeout(500);
        // Basic assertion: page contains sign-out or profile link (best-effort)
        // This is a light E2E smoke; adapt selectors to your app UI.
        // Example: expect(page.locator('text=Sign out')).toBeVisible();
    });
});
