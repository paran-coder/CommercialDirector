# Commercial Director v1.2.0 — Implementation Checklist

## Phase 0 — Plan and contracts
- [x] Create v1.2.0 feature branch from released main
- [x] Update context-notes.md
- [x] Update checklist.md
- [x] Update README.md
- [x] Update User manual.md
- [x] Approve v1.2.0 implementation plan

## Phase 1 — Production domain
- [ ] Add Treatment schemas for 15/30/45 seconds
- [ ] Add Scene Graph schema
- [ ] Add Shot schema
- [ ] Add Prompt IR schema
- [ ] Add compiled prompt bundle schema
- [ ] Add Production Plan schema
- [ ] Add application-assigned canonical scene/shot keys
- [ ] Add deterministic structural validator
- [ ] Add source-binding/stale helper

## Phase 2 — AI orchestration
- [ ] Add Treatment Director prompt
- [ ] Add Scene Director prompt
- [ ] Add Shot Director prompt
- [ ] Add Production Continuity Reviewer
- [ ] Generate shortlisted concepts independently
- [ ] Keep scene/shot dependency ordered within each concept
- [ ] Add bounded targeted repair
- [ ] Reuse model-call retry boundary
- [ ] Add deterministic production fixture

## Phase 3 — Prompt compiler
- [ ] Build model-neutral Prompt IR from validated shots
- [ ] Add generic cinematic compiler
- [ ] Add Seedance compiler
- [ ] Add Kling compiler
- [ ] Add Veo compiler
- [ ] Verify compiler never invents new asset/creative facts
- [ ] Add compiler contract tests

## Phase 4 — Persistence/API
- [ ] Add production_plan generation kind
- [ ] Add production_plan_revisions table
- [ ] Bind Campaign revision
- [ ] Bind Asset Bible revision
- [ ] Bind shortlisted concept keys
- [ ] Add ProjectSnapshot production plan/revisions
- [ ] Add browser fallback revision semantics
- [ ] Add repository saveProductionPlan
- [ ] Add production generation API
- [ ] Reject source drift before persistence

## Phase 5 — Production UI
- [ ] Add Production to navigation
- [ ] Add /projects/[projectId]/production route
- [ ] Add missing/stale Asset Bible prerequisite state
- [ ] Add selected-concept switcher
- [ ] Add 15/30/45 treatment switcher
- [ ] Add Scene Graph view
- [ ] Add expandable Shotlist
- [ ] Add Pro Controls for Prompt IR / provider prompts
- [ ] Add Current / Out of date status
- [ ] Add regeneration
- [ ] Preserve restrained production-tool visual language

## Phase 6 — Tests
- [ ] Treatment variants exactly 15/30/45
- [ ] Canonical scene/shot key stability
- [ ] Valid Asset Bible references only
- [ ] Hero-none prohibits Hero/Wardrobe refs
- [ ] Every scene has shots
- [ ] Shot timing is monotonic
- [ ] Shot duration sum matches treatment within tolerance
- [ ] Prompt IR source identity matches shot
- [ ] Provider compiler determinism
- [ ] Persistence failure does not rerun successful AI work
- [ ] DB-backed generation/hydration/revision/stale E2E

## Release gate
- [ ] PostgreSQL 17 db:push
- [ ] TypeScript typecheck
- [ ] ESLint
- [ ] Next.js production build
- [ ] Playwright full suite
- [ ] Self-review completed
- [ ] Final release-preparation commit CI
- [ ] Open PR to main
- [ ] Squash merge after green CI
- [ ] Re-sync dev/main baseline

## Explicitly deferred
- [ ] Asset reference image rendering — v1.3.0
- [ ] Generated-media continuity inspection — v1.3.0
- [ ] Image/video generation — v2.0.0
- [ ] Timeline assembly — v2.0.0
- [ ] Live-provider smoke test with external credentials
