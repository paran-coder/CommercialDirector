# Commercial Director v1.0.1 — Context Notes

## Product thesis
Commercial Director turns one product image into a structured advertising decision system. v1.0.0 stops before expensive media generation and validates whether users can move from a product image to a strong shortlist of campaign directions.

## Primary users
- Brand / marketer: needs guided decisions, clear concepts, little production jargon.
- Creative / production professional: needs the same project data with deeper production controls.

The product is one application with progressive disclosure, not two separate modes or products.

## Core promise
One product image → Product Intelligence → Creative Brief → Campaign Bible → 4 Creative Territories → 20 Campaign Concepts → Shortlist → Concept Detail.

## v1.0.0 success criterion
A user should want to shortlist at least 3 of 20 generated concepts. The main quality metric is shortlisted concepts / generated concepts.

## Product principles
1. Better decisions over more generations.
2. Build a reusable campaign world before generating executions.
3. Product identity must be explicitly preserved through Identity Locks.
4. 20 concepts must be structurally diverse, not 20 paraphrases.
5. AI output is versioned and never silently overwritten.
6. Provider-specific AI code stays behind adapters.
7. The interface should feel like restrained professional creative software, not a generic AI chat app.
8. Guided users see simple fields first; professional controls expand in place.

## v1.0.0 scope
Included:
- Dashboard/project shell
- Product upload and image preview
- Product Intelligence structure
- Identity Locks
- Creative Brief
- Campaign Bible
- 4 Creative Territories
- 20 Concept Cards
- Concept shortlist state
- Concept Detail
- Pro Controls
- AI provider abstraction
- Real OpenAI provider path behind environment variables
- Deterministic fixture provider for local development
- Structured output validation with Zod
- PostgreSQL/Drizzle schema
- Revision-ready data model

Excluded:
- Video rendering
- Image/character/location asset rendering
- Timeline editor
- Auto edit
- Audio generation
- Social publishing
- Billing
- Team permissions/comments
- Marketplace

## Creative generation architecture
The first implementation is an orchestration pipeline with role-specific prompts and schemas, not autonomous agents conversing with one another.

Pipeline:
Product Analyst → Brief Interpreter → Brand Strategist / Art Director → Territory Generator → 4 × Concept Generator (5 each, parallel) → Quality Gate.

The Quality Gate verifies:
- Brand relevance
- Distinctiveness
- Visual hook clarity
- Product relevance
- Production feasibility
- Cross-concept difference

If a concept is weak or too similar, it is replaced within its territory/execution-type slot.

## Concept matrix
Each of four territories produces five distinct execution types:
- Narrative
- Product spectacle
- Character
- Sensory
- Social

This guarantees 4 × 5 = 20 concept slots before wording is generated.

## Technology decisions
- Next.js 16.x App Router + TypeScript
- React 19.x
- Tailwind CSS
- PostgreSQL
- Drizzle ORM
- Zod
- OpenAI Responses API as the first real provider adapter
- Model ID controlled by environment variable; no product logic assumes a specific model
- Node.js runtime by default

## AI provider rule
`AIProvider` owns only model invocation. Domain services own product logic, schemas, prompt assembly, retries, and evaluation. The same orchestration must work with any future provider adapter.

Development modes:
- `AI_PROVIDER=fixture`: deterministic local data, no API key, fast UI iteration.
- `AI_PROVIDER=openai`: actual structured generation using the Responses API.

## UI direction
Professional and restrained.
- Warm white / neutral background
- Graphite typography
- Thin neutral borders
- Minimal shadows
- Small/medium radii
- Strong editorial hierarchy
- No neon AI gradients, glassmorphism, glowing chat boxes, animated blobs, or metric-heavy dashboard chrome
- Motion is functional and respects reduced-motion

## Versioning
Project artifact version: Commercial-Director-v1.0.0.
Future product milestones:
- v1.1.0: Product/Hero/Wardrobe/Location/Prop asset bible
- v1.2.0: Treatments, scenes, shotlist, prompt compiler
- v1.3.0: Asset generation and continuity checks
- v2.0.0: Video generation, assembly, packshot, cutdowns

## Implementation pass update — 2026-10-01
- New campaigns now use a browser-local project ID rather than redirecting into the hard-coded demo project.
- Browser metadata/state fallback uses localStorage; original uploaded product images use IndexedDB Blob storage to avoid localStorage base64 limits.
- Campaign and concept screens distinguish incomplete local projects from the demo and no longer leak demo campaign data into an unfinished user project.
- The Quality Gate now combines local structural/duplication heuristics with one model-level 20-concept review, then repairs only affected slots (maximum six targeted repairs per pass).
- Concept Detail exposes targeted refinement actions and retains the initial concept plus subsequent local revisions.
- Campaign revisions retain bible + territories + all 20 concepts for future restore semantics.
- The current artifact contains the PostgreSQL/Drizzle schema but does not yet switch runtime project reads/writes to PostgreSQL when DATABASE_URL is configured. Browser persistence is the executable v1 fallback.
- Dependency-backed validation is blocked in this environment because npm registry installation timed out. Independent TypeScript syntax parsing, local import resolution, and fixture 4×5 validation passed.


## Stabilization gate update

The v1.0.0 baseline gate is fixed as: full TypeScript typecheck + ESLint + production Next.js build + core Playwright E2E. A source-only pass does not count as baseline approval. The current execution environment cannot resolve or reach `registry.npmjs.org`, so dependency installation and the full gate cannot execute here.

Stabilization changes already applied:
- Added `npm run verify` to run the four baseline checks in order.
- Added Playwright 1.63.0 core-flow coverage for upload → product intelligence → brief → campaign → exactly 20 concepts → shortlist.
- Fixed Identity Locks so disabling a lock does not remove the option from the UI and it can be re-enabled.
- Added 8 MB client upload guard plus server-side image data-URL validation.
- Set OpenAI Responses requests to `store: false` for proprietary product/brief data.
- Removed `next/font/google` to avoid a separate external font fetch during deterministic CI builds.

Stage 1 PostgreSQL runtime work remains intentionally gated until the four baseline checks can actually run and pass.


## v1.0.1 PostgreSQL runtime — completed
- PostgreSQL is the runtime source of truth when DATABASE_URL is configured.
- Browser localStorage remains a cache and DB-free fallback; source product image Blob storage remains in IndexedDB.
- Added repository abstraction and PostgreSQL implementation for projects, briefs, campaigns, concept revisions, shortlist state, and generation jobs.
- Campaign saves are transactional: campaign revision + territories + concepts + initial concept revisions are committed together.
- Campaign and concept refinement generations record pending/running/succeeded/failed state, attempt count, error, and completion time.
- Generation operations retry once by default; successful creative work is never repeated solely because tracking bookkeeping fails.
- GitHub Actions now boots PostgreSQL 17, pushes the Drizzle schema, and runs the full E2E against DB-backed persistence.
- v1.0.1 full CI gate passed on 2026-10-01.
