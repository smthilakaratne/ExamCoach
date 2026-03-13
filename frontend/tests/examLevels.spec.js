import { test, expect } from "@playwright/test";

test.describe("ExamCoach - Content Categories & Home Page Tests", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/");
    await page.waitForLoadState("domcontentloaded");
  });

  // ─── TEST 1
  test("should display navigation bar", async ({ page }) => {
    await expect(page.locator("nav").first()).toBeVisible({ timeout: 10000 });
  });

  // ─── TEST 2
  test("should display Forum link in navbar", async ({ page }) => {
    await expect(page.locator("nav a[href='/community/forum']").first()).toBeVisible({ timeout: 10000 });
  });

  // ─── TEST 3: 
  test("should display Login link in navbar", async ({ page }) => {
    await expect(page.locator("nav a[href='/login']").first()).toBeVisible({ timeout: 10000 });
  });

  // ─── TEST 4: 
  test("should display Register button in navbar", async ({ page }) => {
    await expect(page.locator("nav a[href='/register']").first()).toBeVisible({ timeout: 10000 });
  });

  // ─── TEST 5: 
  test("should display Mock Exam link in navbar", async ({ page }) => {
    await expect(page.locator("nav a[href='/mock-exam/exam-summary']").first()).toBeVisible({ timeout: 10000 });
  });

  // ─── TEST 6: 
  test("should display browse page without errors", async ({ page }) => {
    await page.goto("http://localhost:5173/browse");
    await expect(page.locator("nav").first()).toBeVisible({ timeout: 10000 });
  });

  // ─── TEST 7: 
  test("should navigate to login page when Login is clicked", async ({ page }) => {
    await page.locator("nav a[href='/login']").first().click();
    await expect(page).toHaveURL(/login/);
  });

  // ─── TEST 8: 
  test("should navigate to register page when Register is clicked", async ({ page }) => {
    await page.locator("nav a[href='/register']").first().click();
    await expect(page).toHaveURL(/register/);
  });

  // ─── TEST 9: 
  test("should display the main portal heading", async ({ page }) => {
    await expect(page.getByText("Welcome To ExamCoach Portal")).toBeVisible({ timeout: 5000 });
  });

  // ─── TEST 10: 
  test("should redirect to dashboard after clicking login", async ({ page }) => {
    await page.locator("nav a[href='/login']").first().click();
    await expect(page).toHaveURL(/dashboard/, { timeout: 5000 });
  });

  // ─── TEST 11: 
  test("should take a screenshot of the home page", async ({ page }) => {
    await expect(page.locator("nav").first()).toBeVisible({ timeout: 10000 });
    await page.screenshot({ path: "test-results/home-page.png", fullPage: true });
  });

});