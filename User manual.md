# Commercial Director v1.0.0 — User Manual

## 1. Start a campaign
From **Projects**, select **New Campaign**. Add one clear product image. Brand and product names are optional.

Select **Analyze product**. In fixture mode the analysis is deterministic; with the real provider enabled, the uploaded image is analyzed through the configured AI adapter.

When you create the campaign, the source image is stored separately as a browser Blob so it can be shown again without putting large base64 data into localStorage.

## 2. Review Product Intelligence
Commercial Director extracts product category, materials, colors, form, finish, perceived positioning, and a concise production-oriented summary.

### Identity Locks
Identity Locks mark visible features that downstream creative work must preserve, such as silhouette, cap, label, logo, product color, or material finish. Toggle only features you intentionally want to make flexible.

Select **Continue to brief**.

## 3. Complete the Creative Brief
Choose or enter:

- Brand personality
- Audience
- Core benefit
- Emotional takeaway
- Desired mood
- Product-specific usage context

A newly created campaign starts with an empty brief rather than inheriting the demo fragrance brief.

Select **Build campaign**. The same request constructs one Campaign Bible, four Creative Territories, and the 20-concept matrix.

## 4. Review the Campaign Bible
The Campaign Bible is the shared source of truth for all concepts. It includes:

- Strategic idea and promise
- Audience
- Visual world
- Hero direction
- Environments
- Product behavior
- Palette

Select **View full production bible** for props, camera language, lighting, sound, and visual directions to avoid.

The four Creative Territories are shown below the foundation. Select **View 20 concepts** to continue.

## 5. Review 20 Concept Cards
Each of the four territories contains one concept in each execution type:

1. Narrative
2. Product spectacle
3. Character
4. Sensory
5. Social

Use territory filters to compare ideas. The bookmark control adds or removes a concept from the shortlist and persists in the local project snapshot.

## 6. Develop a concept
Open **Develop** on a card. Concept Detail shows:

- Hook
- Core idea
- Product role
- Audience takeaway
- 15-second treatment

### Quick refinements
For a campaign generated from your own brief, refine one slot without regenerating the other 19 concepts:

- Make it bolder
- Make it more luxurious
- Reduce production complexity
- Make the product more prominent

The initial concept is preserved before the first revision, and each new revision is appended to local revision history.

### Pro Controls
Enable **Pro controls** for:

- Creative rationale
- Camera language
- Lighting
- Continuity constraints
- Required locations, props, and VFX

Guided and professional users remain in the same project and data model.

## 7. Local prototype persistence
Without a configured server repository, v1.0.0 uses:

- localStorage for typed project snapshots, shortlist state, campaign data, and revision history
- IndexedDB for the original product image Blob

A PostgreSQL/Drizzle schema is included for the production persistence layer, but server repository wiring is not part of this implementation pass.

## 8. What v1.0.0 does not do
This version does not render final images or videos. It is designed to answer the expensive question first: **which advertising direction is worth producing?**

Later milestones add the asset bible, shotlist/prompt compiler, continuity generation, video rendering, packshot, and cutdowns.


## Developer verification

Before treating v1.0.0 as the baseline, install dependencies and Chromium, then run:

```bash
npm install
npm run test:e2e:install
npm run verify
```

The baseline is accepted only when typecheck, lint, production build, and the fixture E2E flow all pass.
