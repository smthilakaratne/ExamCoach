import { test, expect } from '@playwright/test';

test.describe('Mock Exam Flow', () => {

  const BASE_URL = 'http://localhost:5173/mock-exam/exam-summary';

  // ✅ MOCK AUTH (FIXED for your AuthContext issue)
  const mockAuth = async (page) => {
    await page.addInitScript(() => {
      const user = {
        _id: "69d9282fe87b327fee57e128",
        name: "Test User",
        email: "test@test.com",
        role: "admin"
      };

      localStorage.setItem("user", JSON.stringify(user));
      window.__MOCK_USER__ = user;
    });
  };

  // ✅ SAFE START EXAM FLOW
  const startExam = async (page) => {
    await page.goto(BASE_URL);

    // IMPORTANT: match your real option value
    await page.locator('select').selectOption('Maths');

    await page.getByText('Easy').click();

    await Promise.all([
      page.waitForURL(/mock-exam\/exam/),
      page.getByRole('button', { name: 'Start' }).first().click()
    ]);
  };

  test('user can start exam', async ({ page }) => {
    await mockAuth(page);
    await startExam(page);

    await expect(page).toHaveURL(/mock-exam\/exam/);
  });

  test('user sees result after submitting exam', async ({ page }) => {
    await mockAuth(page);
    await startExam(page);

    await expect(page.getByRole('button', { name: 'Submit Exam' }))
      .toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Submit Exam' }).click();

    await expect(page).toHaveURL(/exam-result/);
    await expect(page.getByText(/congratulations/i)).toBeVisible();
  });

  test('user can see answers', async ({ page }) => {
    await mockAuth(page);
    await startExam(page);

    await page.getByRole('button', { name: 'Submit Exam' }).click();

    await expect(page).toHaveURL(/exam-result/);

    await expect(page.getByRole('button', { name: 'See Answers' }))
      .toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'See Answers' }).click();

    await expect(page).toHaveURL(/exam-answers/);

    await expect(page.getByText(/exam/i)).toBeVisible();
  });

});