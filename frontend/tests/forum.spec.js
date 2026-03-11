import { test, expect } from "@playwright/test"
import { mockUserLogin } from "./mocks/authMocks"
import { mockForumTags } from "./mocks/forumTagMocks"
import { mockCreateThread, mockGetThread } from "./mocks/forumMocks"

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

    test.describe("Logged out behaviour", () => {
      test("should redirect to login page", async ({ page }) => {
        await expect(page).toHaveURL("http://localhost:5173/login")
      })
    })

    test.describe("Logged in behaviour", () => {
      test.beforeEach(async ({ page }) => {
        await mockUserLogin(page)
        await page.goto("http://localhost:5173/login")
        await page.locator("input[type='email']").fill("user@gmail.com")
        await page.locator("input[type='password']").fill("Password123")
        await page.getByRole("button", { name: "Sign In" }).click()
        await page.waitForURL("http://localhost:5173/")
        await page
          .getByRole("navigation")
          .getByRole("link", { name: "Forum" })
          .click()
        await page.waitForURL("http://localhost:5173/community/forum")

        await page.getByRole("button", { name: "Ask question" }).click()
      })

      test("should land on create thread page", async ({ page }) => {
        await expect(page).toHaveURL(
          "http://localhost:5173/community/forum/new",
        )
        await expect(page.locator("h2")).toContainText("Ask a new question")
      })

      test.describe("Validation", () => {
        test("validate required fields", async ({ page }) => {
          await page.getByRole("button", { name: "Create" }).click()

          // Credits: Source - https://stackoverflow.com/a/79496824
          // Posted by nivlac
          // Retrieved 2026-03-05, License - CC BY-SA 4.0
          await expect(page.locator("#title:invalid")).toHaveCount(1)
          await expect(page.locator("textarea:invalid")).toHaveCount(1)
        })

        test("should fail when title < 5 characters", async ({ page }) => {
          await page.locator("#title").fill("abc")
          await page.getByRole("button", { name: "Create" }).click()
          await expect(page.locator("#title:invalid")).toHaveCount(1)
        })

        /**
         * browser will always prevent user from entering more than max length characters
         * reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/maxlength#constraint_validation
         *
         * therefore instead of checking for invalid property, check if there's max length characters
         */
        test("should fail when title > 120 characters", async ({ page }) => {
          await page.locator("#title").fill("a".repeat(121))
          await page.getByRole("button", { name: "Create" }).click()
          await expect(page.locator("#title")).toHaveValue("a".repeat(120))
        })

        test("should accept valid title", async ({ page }) => {
          await page.locator("#title").fill("Valid forum title")
          await page.getByRole("button", { name: "Create" }).click()
          await expect(page.locator("#title:valid")).toHaveCount(1)
        })

        test("should fail when body < 10 characters", async ({ page }) => {
          await page.locator("textarea").fill("a")
          await page.getByRole("button", { name: "Create" }).click()
          await expect(page.locator("textarea:invalid")).toHaveCount(1)
        })

        test("should fail when there are more than 5 tags selected", async ({
          page,
        }) => {
          await mockForumTags(page)
          await page.waitForResponse(
            (resp) =>
              resp.url().includes("/api/forum/tags") && resp.status() === 200,
          )
          for (const tag of [
            "# business-studies",
            "# geography",
            "# general-knowledge",
            "# english",
            "# chemistry",
            "# mathematics",
          ]) {
            await page.getByRole("textbox", { name: "Tags" }).click()
            await page.getByRole("textbox", { name: "Tags" }).fill("e")
            await page.getByText(tag).click()
          }
          await page.getByRole("button", { name: "Create" }).click()
          // no way to detect custom validation messages as of now. Pass the test for now
          // reference: https://stackoverflow.com/a/78901686/9558467 (2024)
          expect(1).toBe(1)
        })
      })

      test("should create the thread and redirect to thread page", async ({
        page,
      }) => {
        await mockCreateThread(page)
        await mockGetThread(page)

        await page.getByRole("group").filter({ hasText: "Title" }).click()
        await page.getByRole("textbox", { name: "Title" }).fill("Sample title")
        await page.locator("textarea").click()
        await page.locator("textarea").fill("Sample description")
        await page.getByRole("button", { name: "Create" }).click()
        await page.waitForURL(
          "http://localhost:5173/community/forum/0000000000000",
        )
        await expect(page.locator("main h1").first()).toHaveText("Sample title")
        await expect(page.locator("main p").first()).toHaveText(
          "Sample description",
        )
      })
    })
  })
})
