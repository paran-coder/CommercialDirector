import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const fixtureImage = path.join(process.cwd(), "e2e", "fixtures", "product.png");

test("fixture flow creates a campaign and exactly 20 concepts", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/projects/new");
  await page.getByLabel("Brand name · optional").fill("Test Brand");
  await page.getByLabel("Product name · optional").fill("Test Product");
  await page.locator('input[type="file"]').setInputFiles(fixtureImage);
  await page.getByRole("button", { name: "Analyze product" }).click();
  await expect(page.getByText("Product intelligence", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /Create campaign/ }).click();

  await expect(page.getByRole("heading", { name: "What must remain recognizable." })).toBeVisible();
  const projectId = new URL(page.url()).pathname.split("/")[2];
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

  await first.getByRole("link", { name: /Develop/ }).click();
  await expect(page.getByRole("button", { name: "Make it bolder" })).toBeVisible();
  await page.getByRole("button", { name: "Make it bolder" }).click();
  await expect(page.getByText(/1 revision saved/)).toBeVisible();

  const jobsResponse = await page.request.get(`/api/projects/${projectId}/generations`);
  expect(jobsResponse.ok()).toBeTruthy();
  const jobsBody = await jobsResponse.json();
  expect(jobsBody.generations).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "campaign", status: "succeeded" }),
    expect.objectContaining({ kind: "concept_refinement", status: "succeeded" }),
  ]));

  await page.goto(`/projects/${projectId}/assets`);
  await expect(page.getByRole("heading", { name: "Build the Asset Bible." })).toBeVisible();
  await page.getByRole("button", { name: "Build Asset Bible" }).click();

  await expect(page.getByRole("heading", { name: "Asset Bible" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product Sheet" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hero" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wardrobe" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Locations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Props" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Global Continuity" })).toBeVisible();
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Current", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("product-main", { exact: true })).toBeVisible();

  const assetJobsResponse = await page.request.get(`/api/projects/${projectId}/generations`);
  expect(assetJobsResponse.ok()).toBeTruthy();
  const assetJobsBody = await assetJobsResponse.json();
  expect(assetJobsBody.generations).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "asset_bible", status: "succeeded" }),
  ]));

  await page.getByRole("button", { name: "Regenerate" }).click();
  await expect(page.getByText("Revision 2", { exact: true })).toBeVisible();

  await page.goto(`/projects/${projectId}/production`);
  await expect(page.getByRole("heading", { name: "Turn selected concepts into executable shots." })).toBeVisible();
  await clickAndWaitForProduction(page, "Build Production Plan");

  await expect(page.getByRole("heading", { name: "Production Plan" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Assets r2", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "15s" })).toBeVisible();
  await expect(page.getByRole("button", { name: "30s" })).toBeVisible();
  await expect(page.getByRole("button", { name: "45s" })).toBeVisible();
  await expect(page.getByText(/3 scenes · 6 shots/)).toBeVisible();

  await page.getByRole("button", { name: "Pro controls" }).click();
  await expect(page.getByRole("heading", { name: "Model-neutral source → provider text" })).toBeVisible();
  await page.getByRole("button", { name: "seedance" }).click();
  await expect(page.getByText("seedance", { exact: true }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Current", { exact: true })).toBeVisible();

  const productionJobsResponse = await page.request.get(`/api/projects/${projectId}/generations`);
  expect(productionJobsResponse.ok()).toBeTruthy();
  const productionJobsBody = await productionJobsResponse.json();
  expect(productionJobsBody.generations).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "production_plan", status: "succeeded" }),
  ]));

  await clickAndWaitForProduction(page, "Regenerate");
  await expect(page.getByText("Revision 2", { exact: true })).toBeVisible({ timeout: 15_000 });

  const projectResponse = await page.request.get(`/api/projects/${projectId}`);
  expect(projectResponse.ok()).toBeTruthy();
  const projectBody = await projectResponse.json();
  expect(projectBody.project.assetBibleRevisions).toHaveLength(2);
  expect(projectBody.project.productionPlanRevisions).toHaveLength(2);

  const currentShortlist = projectBody.project.shortlist as string[];
  const refinedConceptKey = currentShortlist[0];
  await page.goto(`/projects/${projectId}/concepts/${refinedConceptKey}`);
  await page.getByRole("button", { name: "Make it bolder" }).click();
  await expect(page.getByText(/2 revisions saved/)).toBeVisible();

  await page.goto(`/projects/${projectId}/production`);
  await expect(page.getByText("Out of date", { exact: true })).toBeVisible();

  const additionalConcept = projectBody.project.concepts.find((concept: { id: string }) => !currentShortlist.includes(concept.id));
  if (!additionalConcept) throw new Error("Expected an additional concept for stale-state verification.");

  const shortlistResponse = await page.request.put(`/api/projects/${projectId}/shortlist`, {
    data: { conceptIds: [...currentShortlist, additionalConcept.id] },
  });
  expect(shortlistResponse.ok()).toBeTruthy();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Refresh the Asset Bible first." })).toBeVisible();
  await page.getByRole("link", { name: "Regenerate Asset Bible" }).click();

  await expect(page.getByText("Out of date", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Regenerate" }).click();
  await expect(page.getByText("Revision 3", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Current", { exact: true })).toBeVisible();

  await page.goto(`/projects/${projectId}/production`);
  await expect(page.getByText("Out of date", { exact: true })).toBeVisible();
});

test("demo concept refinement controls remain reachable", async ({ page }) => {
  await page.goto("/projects/demo-aurelia/concepts/concept-06");
  await expect(page.getByRole("heading", { name: "Last Elevator" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Make it bolder" })).toBeVisible();
  await page.getByRole("button", { name: "Pro controls" }).click();
  await expect(page.getByText("Creative rationale", { exact: true })).toBeVisible();
});


async function clickAndWaitForProduction(page: Page, buttonName: "Build Production Plan" | "Regenerate") {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/ai/production") && response.request().method() === "POST",
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: buttonName }).click();
  const response = await responsePromise;
  const body = await response.text();
  expect(response.ok(), `Production API failed with ${response.status()}: ${body}`).toBeTruthy();
}
