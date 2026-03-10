import { test, expect } from '@playwright/test';

test('Mock exam review page displays answers correctly', async ({ page }) => {

  // open your MERN frontend
  await page.goto('http://localhost:3000');

  // Example: navigate to mock exam review page
  // (adjust selectors depending on your UI)

  await page.getByText('Start Mock Exam').click();

  // wait for questions page
  await page.waitForSelector('text=Exam Review');

  // Assertion 1: Check review page title
  await expect(page.getByText('Exam Review')).toBeVisible();

  // Assertion 2: Verify a question appears
  await expect(page.locator('h3').first()).toBeVisible();

  // Assertion 3: Check if correct/incorrect message exists
  await expect(
    page.locator('text=Your answer is correct.')
  ).toBeVisible();

});