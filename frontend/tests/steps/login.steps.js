import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { chromium, expect } from "@playwright/test";

setDefaultTimeout(60000);

let browser;
let page;

Given("the user is on the login page", async function () {
  browser = await chromium.launch({ headless: false });
  page = await browser.newPage();

  await page.goto("http://localhost:5173/login");

  await page.waitForSelector("#email");
});

When("the user enters valid credentials", async function () {
  await page.fill("#email", "test@gmail.com");
  await page.fill("#password", "123456");

  await page.click("button[type='submit']");
});

Then("the user should be redirected to the homepage", async function () {
  //await page.waitForURL("http://localhost:5173/");
 // await page.waitForURL("**/");
await page.waitForSelector("h2"); 
  await browser.close();
});
