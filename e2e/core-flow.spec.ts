import { expect, test } from "@playwright/test";
import path from "node:path";

const fixtureImage = path.join(process.cwd(), "e2e", "fixtures", "product.png");

test("fixture flow creates a campaign and exactly 20 concepts", async ({ page }) => {
  await page.goto("/projects/new");
  await page.getByLabel("Brand name · optional").fill("Test Brand");
  await page.getByLabel("Product name · optional").fill("Test Product");
  await page.locator('input[type="file"]').setInputFiles(fixtureImage);
  await page.getByRole("button", { name: "Analyze product" }).click();
  await expect(page.getByText("Product intelligence", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Create campaign/ }).click();

  await expect(page.getByRole("heading", { name: "What must remain recognizable." })).toBeVisible();
  await page.getByRole("button", { name: /Continue to brief/ }).click();

  await page.getByRole("button", { name: "Luxury" }).click();
  await page.getByLabel("Age").fill("20–29");
  await page.getByLabel("Audience").fill("Women");
  await page.getByLabel("Context").fill("Urban nightlife");
  await page.getByLabel("Core benefit").fill("Designed for after-dark moments");
  await page.getByLabel("Emotional takeaway").fill("Memorable presence after you leave");
  await page.getByRole("button", { name: "Mysterious" }).click();
  await page.getByRole("button", { name: "Date night" }).click();
  await page.getByRole("button", { name: "Build campaign" }).click();

  await expect(page.getByText("Campaign foundation", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /View 20 concepts/ }).click();
  await expect(page.getByTestId("concept-card")).toHaveCount(20);

  const first = page.getByTestId("concept-card").first();
  await first.getByRole("button", { name: "Toggle shortlist" }).click();
  await expect(page.getByText("1 shortlisted")).toBeVisible();
});

test("demo concept refinement controls remain reachable", async ({ page }) => {
  await page.goto("/projects/demo-aurelia/concepts/concept-07");
  await expect(page.getByRole("heading", { name: "Last Elevator" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Make it bolder" })).toBeVisible();
  await page.getByRole("button", { name: "Pro controls" }).click();
  await expect(page.getByText("Creative rationale", { exact: true })).toBeVisible();
});
