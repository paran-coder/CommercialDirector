# Commercial Director v1.1.0 — Implementation Checklist

> Planning branch. Implementation begins only after this v1.1.0 plan is approved.

## Phase 0 — Plan and contracts
- [x] Create v1.1.0 feature branch from released main
- [x] Update context-notes.md
- [x] Update checklist.md
- [x] Update README.md
- [x] Update User manual.md
- [ ] Approve v1.1.0 implementation plan

## Phase 1 — Asset Bible domain
- [ ] Add Asset Bible Zod schemas
- [ ] Add Product Sheet contract
- [ ] Add Hero contract with required / optional / none applicability
- [ ] Add Wardrobe contract
- [ ] Add Location contract
- [ ] Add Prop contract
- [ ] Add global continuity/conflict contract
- [ ] Add deterministic canonical asset-key normalization
- [ ] Add deterministic structural validator

## Phase 2 — AI orchestration
- [ ] Add Product Continuity Director prompt/schema
- [ ] Add Casting & Styling Director prompt/schema
- [ ] Add Production Designer prompt/schema
- [ ] Run independent asset generation tasks in parallel
- [ ] Build compact shared source context
- [ ] Add compact cross-asset Quality Review
- [ ] Add bounded targeted section repair
- [ ] Reuse model-call retry utility
- [ ] Assign reasoning-effort hints by task
- [ ] Add deterministic fixture Asset Bible

## Phase 3 — Persistence
- [ ] Add asset_bible generation kind
- [ ] Add asset_bible_revisions PostgreSQL table
- [ ] Store source campaign revision
- [ ] Store source shortlisted concept stable keys
- [ ] Add Asset Bible to ProjectSnapshot
- [ ] Add Asset Bible revisions to ProjectSnapshot
- [ ] Add append-only browser fallback revision semantics
- [ ] Add repository saveAssetBible contract
- [ ] Implement PostgreSQL save/hydration
- [ ] Keep persistence commit outside AI retry boundary

## Phase 4 — API
- [ ] Add Asset Bible generation endpoint
- [ ] Validate project/campaign prerequisites
- [ ] Require 1–5 shortlisted concepts
- [ ] Persist successful result transactionally
- [ ] Track pending/running/succeeded/failed generation job
- [ ] Return actionable invalid-shortlist / stale-source errors

## Phase 5 — UI
- [ ] Add Assets to project navigation
- [ ] Add /projects/[projectId]/assets route
- [ ] Add no-campaign empty state
- [ ] Add no-shortlist empty state
- [ ] Add >5 shortlist narrowing state
- [ ] Add Build Asset Bible action
- [ ] Add Product Sheet section
- [ ] Add Hero section
- [ ] Add Wardrobe section
- [ ] Add Locations section
- [ ] Add Props section
- [ ] Add Global Continuity section
- [ ] Show stable asset keys
- [ ] Show concept applicability
- [ ] Show current / out-of-date source status
- [ ] Add Regenerate action
- [ ] Show revision number/history summary
- [ ] Preserve restrained professional UI language and reduced-motion behavior

## Phase 6 — Deterministic tests
- [ ] Verify Product Sheet exactly one
- [ ] Verify Hero applicability contract
- [ ] Verify Wardrobe 0–4
- [ ] Verify Locations 3–6
- [ ] Verify Props 2–8
- [ ] Verify canonical stable keys
- [ ] Verify unique asset keys
- [ ] Verify asset concept refs belong to shortlist
- [ ] Verify Hero-none forbids Wardrobe entries
- [ ] Verify malformed model output retries at call boundary
- [ ] Verify persistence failure does not rerun generation
- [ ] Verify second generation creates revision 2

## Phase 7 — DB-backed E2E
- [ ] Campaign → shortlist → Assets flow
- [ ] Generate Asset Bible
- [ ] Verify all five asset sections
- [ ] Reload and hydrate Asset Bible from PostgreSQL
- [ ] Verify asset_bible generation job success
- [ ] Regenerate and verify revision history
- [ ] Change shortlist and verify out-of-date state

## Release gate
- [ ] PostgreSQL 17 db:push
- [ ] TypeScript typecheck
- [ ] ESLint
- [ ] Next.js production build
- [ ] Playwright full suite
- [ ] Self-review score
- [ ] Open PR to main
- [ ] Squash merge only after green CI
- [ ] Re-sync dev/main baseline after merge

## Explicitly deferred
- [ ] Real reference-image rendering — v1.3.0
- [ ] Scene graph — v1.2.0
- [ ] Shotlist/prompt compiler — v1.2.0
- [ ] Video generation — v2.0.0
