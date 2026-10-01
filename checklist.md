# Commercial Director v1.2.0 — Implementation Checklist

## Phase 0 — Plan and contracts
- [x] Create v1.2.0 feature branch from released main
- [x] Update context-notes.md
- [x] Update checklist.md
- [x] Update README.md
- [x] Update User manual.md
- [x] Approve v1.2.0 implementation plan

## Phase 1 — Production domain
- [x] Add Treatment schemas for 15/30/45 seconds
- [x] Add Scene Graph schema
- [x] Add Shot schema
- [x] Add Prompt IR schema
- [x] Add compiled prompt bundle schema
- [x] Add Production Plan schema
- [x] Add application-assigned canonical scene/shot keys
- [x] Add deterministic structural validator
- [x] Add source-binding/stale helper

## Phase 2 — AI orchestration
- [x] Add Treatment Director prompt
- [x] Add Scene Director prompt
- [x] Add Shot Director prompt
- [x] Add Production Continuity Reviewer
- [x] Generate shortlisted concepts independently
- [x] Keep scene/shot dependency ordered within each concept
- [x] Add bounded targeted repair
- [x] Reuse model-call retry boundary
- [x] Add deterministic production fixture

## Phase 3 — Prompt compiler
- [x] Build model-neutral Prompt IR from validated shots
- [x] Add generic cinematic compiler
- [x] Add Seedance compiler
- [x] Add Kling compiler
- [x] Add Veo compiler
- [x] Verify compiler never invents new asset/creative facts
- [x] Add compiler contract tests

## Phase 4 — Persistence/API
- [x] Add production_plan generation kind
- [x] Add production_plan_revisions table
- [x] Bind Campaign revision
- [x] Bind Asset Bible revision
- [x] Bind shortlisted concept keys
- [x] Add ProjectSnapshot production plan/revisions
- [x] Add browser fallback revision semantics
- [x] Add repository saveProductionPlan
- [x] Add production generation API
- [x] Reject source drift before persistence

## Phase 5 — Production UI
- [x] Add Production to navigation
- [x] Add /projects/[projectId]/production route
- [x] Add missing/stale Asset Bible prerequisite state
- [x] Add selected-concept switcher
- [x] Add 15/30/45 treatment switcher
- [x] Add Scene Graph view
- [x] Add expandable Shotlist
- [x] Add Pro Controls for Prompt IR / provider prompts
- [x] Add Current / Out of date status
- [x] Add regeneration
- [x] Preserve restrained production-tool visual language

## Phase 6 — Tests
- [x] Treatment variants exactly 15/30/45
- [x] Canonical scene/shot key stability
- [x] Valid Asset Bible references only
- [x] Hero-none prohibits Hero/Wardrobe refs
- [x] Every scene has shots
- [x] Shot timing is monotonic
- [x] Shot duration sum matches treatment within tolerance
- [x] Prompt IR source identity matches shot
- [x] Provider compiler determinism
- [x] Persistence failure does not rerun successful AI work
- [x] DB-backed generation/hydration/revision/stale E2E

## Release gate
- [x] PostgreSQL 17 db:push
- [x] TypeScript typecheck
- [x] ESLint
- [x] Next.js production build
- [x] Playwright full suite
- [x] Self-review completed
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
