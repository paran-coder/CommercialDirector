# Commercial Director v1.0.2 — Implementation Checklist

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
- [x] Wire runtime project repository to PostgreSQL when DATABASE_URL is enabled
- [x] Add DB-first browser runtime adapter with local fallback
- [x] Add transactional campaign persistence
- [x] Persist concept revision history in PostgreSQL
- [x] Persist shortlist state in PostgreSQL
- [x] Add generation job state / attempts / failure recovery

## Phase 6 — Validation
- [x] TypeScript syntax parse across all TS/TSX source files
- [x] Resolve all local `@/` imports
- [x] Verify exact fixture 4 × 5 concept matrix
- [x] Verify fixture Identity Lock data
- [x] Verify guided/pro information hierarchy in source implementation
- [x] Full TypeScript typecheck in GitHub Actions
- [x] ESLint in GitHub Actions
- [x] Production `next build` in GitHub Actions
- [x] Add Playwright fixture-flow E2E specification
- [x] Run Playwright end-to-end smoke test against PostgreSQL 17
- [ ] Real-provider smoke test with API key

## v1.0.1 validation
CI provisions PostgreSQL 17, applies the Drizzle schema, and validates typecheck + lint + production build + Playwright E2E. The E2E verifies DB-backed campaign generation, shortlist persistence, generation-job success state, and concept revision persistence.

## Definition of done for v1.0.1
Completed. PostgreSQL is the runtime source of truth when configured, browser persistence remains the no-DB fallback, and the full CI gate passes against a real PostgreSQL service.


## Phase 7 — v1.0.2 AI engine optimization
- [ ] Add per-model-call bounded retry utility
- [ ] Separate AI execution retry from persistence commit
- [ ] Add strict 4 × 5 structural matrix validation
- [ ] Canonicalize generated concept IDs by execution slot
- [ ] Compact model-level quality-review payload
- [ ] Limit repair peer context to relevant concepts
- [ ] Keep repairs targeted and bounded
- [ ] Add deterministic validation coverage through fixture E2E
- [ ] Pass PostgreSQL-backed CI gate
