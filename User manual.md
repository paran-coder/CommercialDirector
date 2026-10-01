# Commercial Director v1.0.2 — User Manual

## 1. Start a campaign
From **Projects**, choose **New Campaign** and add one clear product image. Brand and product names are optional.

Choose **Analyze product**. Fixture mode is deterministic; real-provider mode analyzes the uploaded image through the configured AI adapter.

The original image is stored as a browser Blob in IndexedDB so large base64 data is not placed in localStorage.

## 2. Review Product Intelligence
Review category, materials, colors, form, finish, perceived positioning, and the production-oriented summary.

### Identity Locks
Identity Locks mark visible features that downstream creative work should preserve, such as silhouette, cap, label, logo, product color, or material finish. Every lock remains reversible.

Choose **Continue to brief**.

## 3. Complete the Creative Brief
Set brand personality, audience, core benefit, emotional takeaway, mood, occasion/context, and constraints. Then choose **Build campaign**.

The engine constructs one Campaign Bible, four Creative Territories, and exactly 20 concept slots.

## 4. Review the Campaign Bible
The Campaign Bible is shared campaign context: strategic idea and promise, audience, visual world, hero direction, environments, product behavior, palette, props, camera language, lighting, and sound.

Choose **View 20 concepts** to continue.

## 5. Review 20 Concept Cards
Each territory contains exactly one:
1. Narrative
2. Product spectacle
3. Character
4. Sensory
5. Social

Use filters to compare territories. Bookmark controls update the shortlist. With PostgreSQL configured, shortlist state is server-persisted; otherwise the browser fallback is used.

## 6. Develop and refine a concept
Choose **Develop** on a card to review its hook, core idea, product role, audience takeaway, and 15-second treatment.

Quick refinements revise only the selected slot:
- Make it bolder
- Make it more luxurious
- Reduce production complexity
- Make the product more prominent

The initial concept and subsequent revisions are preserved. PostgreSQL environments keep this history server-side.

### Pro Controls
Pro Controls expose creative rationale, camera, lighting, continuity constraints, and required locations/props/VFX.

## 7. Persistence modes
With `DATABASE_URL` configured, PostgreSQL is the runtime source of truth for projects, briefs, campaigns, concepts, shortlist state, revisions, and generation jobs.

Without `DATABASE_URL`, the typed localStorage fallback keeps the prototype runnable. IndexedDB continues to store the source image Blob.

## 8. AI engine behavior
v1.0.2 retries individual model calls on transient or malformed structured-output failures. The engine validates the 4 × 5 concept matrix locally before model quality review, repairs only affected territories/slots, and never repeats a successful AI generation just because the database commit or job bookkeeping failed.

## 9. Current product boundary
Commercial Director v1.0.2 does not render final images or videos. Its purpose is to determine which advertising directions deserve production.

## Developer verification

```bash
npm install
npm run test:e2e:install
npm run db:push
npm run verify
```

GitHub Actions runs the same quality gate against PostgreSQL 17.
