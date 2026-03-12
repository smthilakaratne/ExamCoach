
import { test, expect } from '@playwright/test';

test.describe('Mock Exam Flow', () => {

  test('user can start exam', async ({ page }) => {
//starting point of user flow (exam level page)
  await page.goto('http://localhost:5173/mock-exam/exam-summary');

  await page.locator('select').selectOption('Math');

  await page.getByText('Easy').click();

  await page.getByRole('button', { name: 'Start' }).first().click();

});

  test('user sees result after submitting exam', async ({ page }) => {

    await page.goto('http://localhost:5173/mock-exam/exam-summary');

  await page.locator('select').selectOption('Math');

  await page.getByText('Easy').click();

  await page.getByRole('button', { name: 'Start' }).first().click();

    // exam page
    await expect(page).toHaveURL(/mock-exam\/exam/);

    // submit exam
    await page.getByRole('button', { name: 'Submit Exam' }).click();

    // verify result page
    await expect(page).toHaveURL(/exam-result/);

    await expect(page.getByText('Congratulations!')).toBeVisible();
  });


  test('user can see answers', async ({ page }, testInfo) => {

     await page.goto('http://localhost:5173/mock-exam/exam-summary');

  await page.locator('select').selectOption('Math');

  await page.getByText('Easy').click();

  await page.getByRole('button', { name: 'Start' }).first().click();

    // submit
    await page.getByRole('button', { name: 'Submit Exam' }).click();

    // result page
    await expect(page).toHaveURL(/exam-result/);

    // go to answers
    await page.getByRole('button', { name: 'See Answers' }).click();

    // verify answers page
    await expect(page).toHaveURL(/exam-answers/);

    try {
      await expect(page.getByText('Exam ')).toBeVisible();
  } catch (err) {
    await page.screenshot({ path: `failure-${testInfo.title}.png` });
    throw err; // rethrow to fail the test
  }


  });

});