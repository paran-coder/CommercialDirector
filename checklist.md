# Commercial Director v1.1.0 — Implementation Checklist

## Phase 0 — Plan and contracts
- [x] Create v1.1.0 feature branch from released main
- [x] Update context-notes.md
- [x] Update checklist.md
- [x] Update README.md
- [x] Update User manual.md
- [x] Approve v1.1.0 implementation plan

## Phase 1 — Asset Bible domain
- [x] Add Asset Bible Zod schemas
- [x] Add Product Sheet contract
- [x] Add Hero required / optional / none contract
- [x] Add Wardrobe contract
- [x] Add Location contract
- [x] Add Prop contract
- [x] Add Global Continuity contract
- [x] Add deterministic canonical asset-key normalization
- [x] Add deterministic structural validator

## Phase 2 — AI orchestration
- [x] Add Product Continuity Director
- [x] Add Casting & Styling Director
- [x] Add Production Designer
- [x] Run independent asset generation tasks in parallel
- [x] Build compact shared source context
- [x] Add compact cross-asset Quality Review
- [x] Add bounded targeted section repair
- [x] Feed deterministic structural issues into repair path
- [x] Reuse model-call retry utility
- [x] Assign reasoning-effort hints by task
- [x] Add deterministic fixture Asset Bible

## Phase 3 — Persistence
- [x] Add asset_bible generation kind
- [x] Add asset_bible_revisions PostgreSQL table
- [x] Store source Campaign revision
- [x] Store source shortlisted concept stable keys
- [x] Add Asset Bible to ProjectSnapshot
- [x] Add Asset Bible revisions to ProjectSnapshot
- [x] Add append-only browser fallback revision semantics
- [x] Add repository saveAssetBible contract
- [x] Implement PostgreSQL save/hydration
- [x] Keep persistence commit outside AI retry boundary
- [x] Recheck Campaign/shortlist source before commit

## Phase 4 — API
- [x] Add Asset Bible generation endpoint
- [x] Validate project/campaign prerequisites
- [x] Require 1–5 shortlisted concepts
- [x] Persist successful result
- [x] Track generation job state
- [x] Reject source drift before persistence

## Phase 5 — UI
- [x] Add Assets to project navigation
- [x] Add /projects/[projectId]/assets route
- [x] Add no-campaign state
- [x] Add no-shortlist state
- [x] Add >5 shortlist narrowing state
- [x] Add Build Asset Bible action
- [x] Add Product Sheet
- [x] Add Hero
- [x] Add Wardrobe
- [x] Add Locations
- [x] Add Props
- [x] Add Global Continuity
- [x] Show stable asset keys
- [x] Show concept applicability
- [x] Show current / out-of-date status
- [x] Add Regenerate
- [x] Show revision/source summary
- [x] Preserve restrained professional UI

## Phase 6 — Deterministic tests
- [x] Product Sheet exactly one
- [x] Hero applicability contract
- [x] Hero-none produces no wardrobe
- [x] Wardrobe 0–4
- [x] Locations 3–6
- [x] Props 2–8
- [x] Canonical stable keys
- [x] Unique asset keys
- [x] Asset concept refs belong to shortlist
- [x] Invalid shortlist rejection
- [x] Persistence failure does not rerun successful Asset Bible generation

## Phase 7 — DB-backed E2E
- [x] Campaign → shortlist → Assets flow
- [x] Generate Asset Bible
- [x] Verify all production sections
- [x] Reload and hydrate from PostgreSQL
- [x] Verify asset_bible generation job success
- [x] Regenerate and verify revision 2
- [x] Change shortlist and verify Out of date state

## Release gate
- [x] PostgreSQL 17 db:push
- [x] TypeScript typecheck
- [x] ESLint
- [x] Next.js production build
- [x] Playwright full suite on feature implementation
- [x] Self-review completed
- [ ] Final release-preparation commit CI
- [ ] Open PR to main
- [ ] Squash merge only after final green CI
- [ ] Re-sync dev/main baseline after merge

## Explicitly deferred
- [ ] Real reference-image rendering — v1.3.0
- [ ] Scene graph — v1.2.0
- [ ] Shotlist/prompt compiler — v1.2.0
- [ ] Video generation — v2.0.0
- [ ] Live-provider smoke test with external API credentials
