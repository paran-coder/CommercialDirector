import { expect, test, type Page } from "@playwright/test";
import path from "node:path";

const fixtureImage = path.join(process.cwd(), "e2e", "fixtures", "product.png");

test("fixture flow creates a campaign and exactly 20 concepts", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("/projects/new");
  await page.getByLabel("브랜드명 · 선택").fill("Test Brand");
  await page.getByLabel("제품명 · 선택").fill("Test Product");
  await page.locator('input[type="file"]').setInputFiles(fixtureImage);
  await page.getByRole("button", { name: "제품 분석" }).click();
  await expect(page.getByText("Product Intelligence · 제품 분석", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /캠페인 만들기/ }).click();

  await expect(page.getByRole("heading", { name: "무엇이 달라지면 안 되는지 확인합니다." })).toBeVisible();
  const projectId = new URL(page.url()).pathname.split("/")[2];
  await page.getByRole("button", { name: /브리프로 이동/ }).click();

  await page.getByRole("button", { name: "럭셔리" }).click();
  await page.getByLabel("연령").fill("20–29");
  await page.getByLabel("대상").fill("Women");
  await page.getByLabel("상황/라이프스타일").fill("Urban nightlife");
  await page.getByLabel("핵심 효익").fill("Designed for after-dark moments");
  await page.getByLabel("감정적 인상").fill("Memorable presence after you leave");
  await page.getByRole("button", { name: "신비로운" }).click();
  await page.getByRole("button", { name: "데이트/저녁 외출" }).click();
  await page.getByRole("button", { name: "캠페인 만들기" }).click();

  await expect(page.getByText("Campaign Bible · 캠페인 기반", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /20개 Concept 보기/ }).click();
  await expect(page.getByTestId("concept-card")).toHaveCount(20);

  const first = page.getByTestId("concept-card").first();
  await first.getByRole("button", { name: "shortlist 선택 전환" }).click();
  await expect(page.getByText("shortlist 1개")).toBeVisible();

  await first.getByRole("link", { name: /자세히 보기/ }).click();
  await expect(page.getByRole("button", { name: "더 대담하게" })).toBeVisible();
  await page.getByRole("button", { name: "더 대담하게" }).click();
  await expect(page.getByText(/수정 revision 1개 저장됨/)).toBeVisible();

  const jobsResponse = await page.request.get(`/api/projects/${projectId}/generations`);
  expect(jobsResponse.ok()).toBeTruthy();
  const jobsBody = await jobsResponse.json();
  expect(jobsBody.generations).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "campaign", status: "succeeded" }),
    expect.objectContaining({ kind: "concept_refinement", status: "succeeded" }),
  ]));

  await page.goto(`/projects/${projectId}/assets`);
  await expect(page.getByRole("heading", { name: "Asset Bible을 만듭니다." })).toBeVisible();
  await page.getByRole("button", { name: "Asset Bible 만들기" }).click();

  await expect(page.getByRole("heading", { name: "Asset Bible" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Product Sheet" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Hero" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Wardrobe" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Locations" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Props" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Global Continuity" })).toBeVisible();
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Current · 최신", { exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("product-main", { exact: true })).toBeVisible();

  const assetJobsResponse = await page.request.get(`/api/projects/${projectId}/generations`);
  expect(assetJobsResponse.ok()).toBeTruthy();
  const assetJobsBody = await assetJobsResponse.json();
  expect(assetJobsBody.generations).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "asset_bible", status: "succeeded" }),
  ]));

  await page.getByRole("button", { name: "재생성" }).click();
  await expect(page.getByText("Revision 2", { exact: true })).toBeVisible();

  await page.goto(`/projects/${projectId}/production`);
  await expect(page.getByRole("heading", { name: "선택한 Concept를 실제 촬영 가능한 Shot으로 바꿉니다." })).toBeVisible();
  await clickAndWaitForProduction(page, "Production Plan 만들기");

  await expect(page.getByRole("heading", { name: "Production Plan" })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Assets r2", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "15s" })).toBeVisible();
  await expect(page.getByRole("button", { name: "30s" })).toBeVisible();
  await expect(page.getByRole("button", { name: "45s" })).toBeVisible();
  await expect(page.getByText(/Scene 3개 · Shot 6개/)).toBeVisible();

  await page.getByRole("button", { name: "Pro Controls" }).click();
  await expect(page.getByRole("heading", { name: "모델 중립 Prompt IR → provider용 prompt" })).toBeVisible();
  await page.getByRole("button", { name: "seedance" }).click();
  await expect(page.getByText("seedance", { exact: true }).first()).toBeVisible();

  await page.reload();
  await expect(page.getByText("Revision 1", { exact: true })).toBeVisible();
  await expect(page.getByText("Current · 최신", { exact: true })).toBeVisible();

  const productionJobsResponse = await page.request.get(`/api/projects/${projectId}/generations`);
  expect(productionJobsResponse.ok()).toBeTruthy();
  const productionJobsBody = await productionJobsResponse.json();
  expect(productionJobsBody.generations).toEqual(expect.arrayContaining([
    expect.objectContaining({ kind: "production_plan", status: "succeeded" }),
  ]));

  await clickAndWaitForProduction(page, "재생성");
  await expect(page.getByText("Revision 2", { exact: true })).toBeVisible({ timeout: 15_000 });

  const projectResponse = await page.request.get(`/api/projects/${projectId}`);
  expect(projectResponse.ok()).toBeTruthy();
  const projectBody = await projectResponse.json();
  expect(projectBody.project.assetBibleRevisions).toHaveLength(2);
  expect(projectBody.project.productionPlanRevisions).toHaveLength(2);

  const currentShortlist = projectBody.project.shortlist as string[];
  const refinedConceptKey = currentShortlist[0];
  await page.goto(`/projects/${projectId}/concepts/${refinedConceptKey}`);
  await page.getByRole("button", { name: "더 대담하게" }).click();
  await expect(page.getByText(/수정 revision 2개 저장됨/)).toBeVisible();

  await page.goto(`/projects/${projectId}/production`);
  await expect(page.getByText("Out of date · 재생성 필요", { exact: true })).toBeVisible();

  const additionalConcept = projectBody.project.concepts.find((concept: { id: string }) => !currentShortlist.includes(concept.id));
  if (!additionalConcept) throw new Error("Expected an additional concept for stale-state verification.");

  const shortlistResponse = await page.request.put(`/api/projects/${projectId}/shortlist`, {
    data: { conceptIds: [...currentShortlist, additionalConcept.id] },
  });
  expect(shortlistResponse.ok()).toBeTruthy();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Asset Bible을 먼저 최신 상태로 맞춰 주세요." })).toBeVisible();
  await page.getByRole("link", { name: "재생성 Asset Bible" }).click();

  await expect(page.getByText("Out of date · 재생성 필요", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "재생성" }).click();
  await expect(page.getByText("Revision 3", { exact: true })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText("Current · 최신", { exact: true })).toBeVisible();

  await page.goto(`/projects/${projectId}/production`);
  await expect(page.getByText("Out of date · 재생성 필요", { exact: true })).toBeVisible();
});

test("demo concept refinement controls remain reachable", async ({ page }) => {
  await page.goto("/projects/demo-aurelia/concepts/concept-06");
  await expect(page.getByRole("heading", { name: "마지막 엘리베이터" })).toBeVisible();
  await expect(page.getByRole("button", { name: "더 대담하게" })).toBeVisible();
  await page.getByRole("button", { name: "Pro Controls" }).click();
  await expect(page.getByText("크리에이티브 근거", { exact: true })).toBeVisible();
});


test("Korean manual and social metadata are available", async ({ page }) => {
  await page.goto("/manual");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await expect(page.getByRole("heading", { name: "한 장의 제품 이미지에서 제작 가능한 광고 설계까지." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "선택한 아이디어를 반복 제작 가능한 Asset 시스템으로 바꿉니다." })).toBeVisible();
  await expect(page.getByText("Out of date · 재생성 필요", { exact: true })).toBeVisible();

  const ogImage = page.locator('meta[property="og:image"]');
  await expect(ogImage).toHaveAttribute("content", /\/og-image\.png$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
});


async function clickAndWaitForProduction(page: Page, buttonName: "Production Plan 만들기" | "재생성") {
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes("/api/ai/production") && response.request().method() === "POST",
    { timeout: 20_000 },
  );
  await page.getByRole("button", { name: buttonName }).click();
  const response = await responsePromise;
  const body = await response.text();
  expect(response.ok(), `Production API failed with ${response.status()}: ${body}`).toBeTruthy();
}
