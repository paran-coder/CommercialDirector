# Commercial Director v1.1.0 — Asset Bible planning

> `main` currently represents the released Commercial-Director-v1.0.2 baseline. This feature branch defines the v1.1.0 implementation before code changes begin.

Commercial Director is a creative decision system that turns one product image into a campaign foundation, 20 structured advertising directions, and—starting in v1.1.0—a reusable production Asset Bible for selected directions.

## Planned v1.1.0 flow

`Product → Brief → Campaign Bible → 20 Concepts → Shortlist 1–5 → Asset Bible`

The Asset Bible deliberately comes after shortlist. Production detail should be created for directions the user has chosen, not for all 20 concepts.

## Asset Bible scope

v1.1.0 adds structured production specifications for:

- Product Sheet
- Hero
- Wardrobe
- Locations
- Props
- Global Continuity

This release does **not** generate final images or video.

## Source of truth

An Asset Bible revision is bound to:
- one Campaign Bible revision,
- a snapshot of 1–5 shortlisted concept stable keys.

If either source changes, the current Asset Bible is marked out of date. Regeneration creates a new revision rather than overwriting prior output.

## Stable asset keys

Stable asset identity is assigned by application code, not trusted to free-form model naming.

Examples:
- `product-main`
- `hero-primary`
- `wardrobe-01`
- `location-01`
- `prop-01`

These keys become the contract that v1.2.0 scenes and shotlists can reference.

## Planned AI pipeline

Three role-specific structured generation jobs run from one compact source context:

1. Product Continuity Director → Product Sheet
2. Casting & Styling Director → Hero + Wardrobe
3. Production Designer → Locations + Props

Independent calls run in parallel. Application code then canonicalizes stable keys and performs deterministic structural checks. A compact cross-asset review checks continuity and contradictions; only affected sections may be repaired.

Existing v1.0.2 guarantees remain:
- provider abstraction
- Zod structured output
- bounded per-call retry
- reasoning-effort hints
- no duplicate AI work after persistence failure

## Planned persistence

PostgreSQL gains `asset_bible_revisions` with:
- project
- revision
- source campaign revision
- source concept-key snapshot
- full structured Asset Bible data
- creation time

The project runtime snapshot gains latest Asset Bible plus revision history. Browser fallback mirrors the append-only behavior.

Generation tracking gains `asset_bible`.

## Planned UI

New route:

`/projects/[projectId]/assets`

Navigation order:

`Product → Brief → Campaign → Concepts → Assets`

The page is an editorial production document, not an image gallery. It shows source/revision status followed by Product Sheet, Hero, Wardrobe, Locations, Props, and Global Continuity.

Prerequisites:
- campaign exists,
- 1–5 concepts are shortlisted.

## Quality gate

v1.1.0 is not merged to main until all of the following pass against PostgreSQL 17:

```bash
npm run db:push
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

E2E must cover Asset Bible generation, DB hydration, generation-job state, revision append behavior, and out-of-date detection after shortlist changes.

## Current status

Planning complete; implementation awaiting approval.

Current release: Commercial-Director-v1.0.2  
Feature target: Commercial-Director-v1.1.0
