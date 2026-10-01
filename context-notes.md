# Commercial Director v1.1.0 — Context Notes

## Product thesis
Commercial Director is a creative decision system: one product image becomes a campaign world, 20 structured concepts, a shortlist, and now a reusable production Asset Bible.

## v1.1.0 completed scope
- Product Sheet
- Hero
- Wardrobe
- Locations
- Props
- Global Continuity
- Assets project route
- append-only Asset Bible revisions
- source Campaign revision binding
- source shortlist binding
- stale-source detection
- Asset Bible generation-job tracking
- PostgreSQL and browser-fallback persistence
- deterministic fixture and DB-backed E2E coverage

## Dependency rule
Asset Bible is generated **after** shortlist, not before the 20 concepts.

Prerequisites:
- Product Intelligence exists
- Campaign Bible exists
- current 4 × 5 concept matrix exists
- shortlist contains 1–5 concepts

This avoids spending production-detail generation on directions the user has not chosen.

## Domain contracts

### Product Sheet
Exactly one canonical Product Sheet using stable key `product-main`.

It preserves:
- identity statement
- visible product identity features
- form/silhouette rules
- materials and surface response
- color and marking rules
- scale and handling cues
- preferred hero angles
- unacceptable substitutions/distortions
- product continuity locks

### Hero
Exactly one canonical Hero record using stable key `hero-primary`.

Applicability:
- required
- optional
- none

If applicability is `none`, Wardrobe must be empty.

### Wardrobe
Zero to four reusable looks with canonical keys `wardrobe-01...`.

### Locations
Three to six reusable environments with canonical keys `location-01...`.

### Props
Two to eight canonical production props with keys `prop-01...`.

### Global Continuity
Stores:
- campaign-wide rules
- intentional differences/conflicts that should remain distinct
- production notes

## AI orchestration
Asset Bible uses three parallel structured generation calls:
1. Product Continuity Director
2. Casting & Styling Director
3. Production Designer

A compact cross-asset review follows.

Application code—not the model—assigns stable keys. Deterministic validation checks:
- section counts
- key uniqueness
- shortlisted concept references
- Hero/Wardrobe compatibility
- minimum continuity coverage

Model-review issues and deterministic structural issues both feed the same bounded targeted repair path.

## Prompt payload discipline
Asset generation receives:
- Product Intelligence and Identity Locks
- compact Campaign Bible context
- only shortlisted concepts
- compact concept fields: stable key, type, title, hook, product role, requirements
- territory title/premise

It does not resend full Concept Detail/Pro content to every role.

## Persistence
PostgreSQL table: `asset_bible_revisions`

Stored per revision:
- project ID
- revision
- source Campaign revision
- source concept-key snapshot
- complete Asset Bible JSON
- created time

The repository hydrates both the latest Asset Bible and full revision history into `ProjectSnapshot`.

Generation kind now includes `asset_bible`.

## Concurrency/source drift
Generation runs from one source snapshot. Before commit, the server reloads the project and compares:
- latest Campaign revision
- current shortlist set

If either changed, persistence is rejected. Because persistence is outside the AI retry boundary, this rejection does not rerun successful model work.

## Stale detection
`isAssetBibleCurrent(project)` compares the latest Asset Bible source binding against the current project source.

A changed Campaign Bible or shortlist marks the current Asset Bible out of date without deleting it.

## UI
New project navigation item: Assets.

The Assets view handles:
- no campaign
- no shortlist
- shortlist >5
- initial generation
- current revision metadata
- regenerate
- out-of-date state
- Product Sheet / Hero / Wardrobe / Locations / Props / Global Continuity sections
- stable keys and concept applicability

The visual language remains restrained, editorial, and production-oriented.

## Validation
The feature-head gate passed against PostgreSQL 17 before release preparation:
- db:push
- typecheck
- ESLint
- production build
- Playwright

The suite covers Asset Bible engine invariants and the DB-backed user flow through revision 2 and stale-state detection.

## Deferred
- reference-image rendering: v1.3.0
- scenes and shotlist: v1.2.0
- prompt compiler: v1.2.0
- video generation and assembly: v2.0.0
