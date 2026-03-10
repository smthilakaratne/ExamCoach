import { test, expect } from "@playwright/test"

test.describe("Forum", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173/")
    await page
      .getByRole("navigation")
      .getByRole("link", { name: "Forum" })
      .click()
  })

  test.describe("Create thread", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: "Ask question" }).click()
    })

    test("validate required fields", async ({ page }) => {
      await page.getByRole("button", { name: "Create" }).click()

      // Credits: Source - https://stackoverflow.com/a/79496824
      // Posted by nivlac
      // Retrieved 2026-03-05, License - CC BY-SA 4.0
      await page.waitForSelector("input#title[required]:invalid")
      await page.waitForSelector("textarea:invalid")
    })
  })
})
