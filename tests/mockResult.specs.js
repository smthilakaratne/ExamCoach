import { test, expect } from '@playwright/test';

test.describe('MockResult Page', () => {

  test('should display exam result correctly', async ({ page }) => {

    // Go to result page with state simulated via query params
    await page.goto('http://localhost:5173/mock-exam/exam-summary');

    // Assertions
    await expect(page.getByText('Congratulations!')).toBeVisible();

    await expect(page.getByText('Level:')).toBeVisible();

    await expect(page.getByText('Your score:')).toBeVisible();

  });

  test('should have navigation buttons', async ({ page }) => {

    await page.goto('http://localhost:5173/mock-exam/exam-summary');

    const seeAnswersBtn = page.getByRole('button', { name: 'See Answers' });
    const backBtn = page.getByRole('button', { name: 'Back to Levels' });

    await expect(seeAnswersBtn).toBeVisible();
    await expect(backBtn).toBeVisible();

  });

  test('should navigate to answers page when clicking See Answers', async ({ page }) => {

    await page.goto('http://localhost:5173/mock-exam/exam-summary');

    await page.getByRole('button', { name: 'See Answers' }).click();

    await expect(page).toHaveURL(/exam-answers/);

  });

  test('should navigate back to levels', async ({ page }) => {

    await page.goto('http://localhost:5173/mock-exam/exam-summary');

    await page.getByRole('button', { name: 'Back to Levels' }).click();

    await expect(page).toHaveURL(/mock-levels/);

  });

});