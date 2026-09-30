# Commercial Director v1.0.0 — Implementation Checklist

## Phase 0 — Project records
- [x] Create context-notes.md
- [x] Create checklist.md
- [x] Create README.md
- [x] Create User manual.md

## Phase 1 — Foundation
- [x] Create Next.js 16 App Router project shell
- [x] Add Tailwind styling foundation
- [x] Add domain-first folder structure
- [x] Define environment contract
- [x] Add PostgreSQL + Drizzle schema
- [x] Add Zod domain schemas
- [x] Add AIProvider interface
- [x] Add deterministic fixture provider
- [x] Add OpenAI provider adapter
- [x] Add structured-output parsing and validation

## Phase 2 — Intelligence pipeline
- [x] Product Analyst contract
- [x] Creative Brief contract
- [x] Campaign Bible contract
- [x] Creative Territory contract
- [x] Concept contract
- [x] Quality Gate contract
- [x] Prompt library
- [x] Orchestration service

## Phase 3 — Concept generation strategy
- [x] Generate exactly 4 territories
- [x] Generate exactly 5 execution types per territory
- [x] Run territory generation in parallel where independent
- [x] Validate 20 total concepts through schema contracts
- [x] Detect duplicate/near-duplicate hooks with heuristic gate
- [x] Add model-level set review for brand/product/visual/feasibility issues
- [x] Replace weak slots without regenerating the whole campaign

## Phase 4 — UI
- [x] App shell / restrained navigation
- [x] Dashboard including locally created projects
- [x] Product upload
- [x] Preserve source product image in IndexedDB
- [x] Keep all Identity Lock options reversible after toggling
- [x] Product Intelligence
- [x] Identity Locks
- [x] Creative Brief
- [x] Campaign Bible
- [x] Creative Territory overview/navigation
- [x] 20 Concept Cards
- [x] Shortlist state
- [x] Concept Detail
- [x] Pro Controls progressive disclosure
- [x] Slot-level Quick Refinements
- [x] Useful generation/loading states without fake percentages
- [x] Reduced-motion support
- [x] Responsive behavior

## Phase 5 — Persistence and revisions
- [x] Browser project persistence fallback
- [x] Product/brief/bible local persistence
- [x] Territory/concept local persistence
- [x] Shortlist persistence
- [x] Original product image Blob persistence
- [x] PostgreSQL revision-ready schema
- [x] Local campaign revision snapshots
- [x] Local concept revision history preserving the initial concept
- [x] Regeneration/refinement action contract
- [ ] Wire runtime project repository to PostgreSQL when DATABASE_URL is enabled

## Phase 6 — Validation
- [x] TypeScript syntax parse across all TS/TSX source files
- [x] Resolve all local `@/` imports
- [x] Verify exact fixture 4 × 5 concept matrix
- [x] Verify fixture Identity Lock data
- [x] Verify guided/pro information hierarchy in source implementation
- [ ] Full TypeScript typecheck after dependencies install
- [ ] ESLint after dependencies install
- [ ] Production `next build` after dependencies install
- [x] Add Playwright fixture-flow E2E specification
- [ ] Run Playwright fixture end-to-end smoke test after dependencies install
- [ ] Real-provider smoke test with API key

## Environment limitation recorded
`npm install --no-audit --no-fund` cannot reach the npm registry in this execution environment because outbound DNS/network access is unavailable. Dependency-backed checks therefore cannot run here. Source parsing, local import resolution, fixture matrix validation, upload guards, reversible Identity Locks, and an executable Playwright E2E spec were completed independently.

## Definition of done for this implementation pass
The source implements the full v1 guided flow, provider abstraction, 4×5 concept generation and repair strategy, product-image preservation, shortlist persistence, slot-level concept refinement, and a deterministic E2E test. v1.0.0 is **not yet baseline-approved** because the agreed gate requires typecheck + lint + build + E2E to execute successfully. PostgreSQL runtime wiring remains blocked behind that gate.
