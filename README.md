# Commercial Director v1.1.0

Commercial Director is a creative decision system that turns one product image into a campaign foundation, 20 structured advertising concepts, and a reusable production Asset Bible for selected directions.

## Product flow

`Product Image → Product Intelligence → Identity Locks → Creative Brief → Campaign Bible → 4 Territories → 20 Concepts → Shortlist 1–5 → Asset Bible`

v1.1.0 still ends before final image/video rendering. It adds the production-specification layer required by later scenes, shotlists, prompt compilation, continuity checks, and media generation.

## Asset Bible

Asset Bible is generated only after the user shortlists between one and five concepts.

It contains:
- Product Sheet
- Hero
- Wardrobe
- Locations
- Props
- Global Continuity

The page is a production document rather than an image gallery.

## Stable asset identity

Application code assigns canonical stable keys rather than trusting model-generated names:

- `product-main`
- `hero-primary`
- `wardrobe-01`, `wardrobe-02`, ...
- `location-01`, `location-02`, ...
- `prop-01`, `prop-02`, ...

These keys are the downstream contract for v1.2.0 scenes and shotlists.

## AI pipeline

Three structured generation tasks run in parallel from a compact shared source context:

1. Product Continuity Director → Product Sheet
2. Casting & Styling Director → Hero + Wardrobe
3. Production Designer → Locations + Props

The engine then:
1. runs a compact cross-asset continuity review,
2. normalizes canonical asset keys,
3. validates counts, shortlist references, Hero/Wardrobe compatibility, key uniqueness, and continuity constraints,
4. repairs only affected section groups,
5. validates the final Asset Bible before returning it.

Existing v1.0.2 guarantees remain:
- provider abstraction
- Zod structured output
- bounded model-call retry
- task-level reasoning effort hints
- persistence failures do not rerun successful AI work

## Persistence and revisions

PostgreSQL is the source of truth when `DATABASE_URL` is configured.

v1.1.0 adds `asset_bible_revisions`, storing:
- project
- revision number
- source Campaign Bible revision
- source shortlisted concept stable keys
- complete structured Asset Bible
- creation time

Regeneration appends a new revision; earlier revisions are never silently overwritten.

Before persistence commit, the API rechecks the current Campaign Bible revision and shortlist. If either changed during generation, the result is not committed and the user is asked to generate again from the current source.

Without PostgreSQL, the browser fallback mirrors append-only Asset Bible revisions.

## Stale-source behavior

The latest Asset Bible is considered current only when:
- its source Campaign Bible revision equals the latest Campaign Bible revision, and
- its source concept-key set equals the current shortlist.

If either changes, Assets shows **Out of date** while preserving the previous revision.

## UI

New route:

`/projects/[projectId]/assets`

Project navigation:

`Product → Brief → Campaign → Concepts → Assets`

Prerequisite states:
- no campaign → return to Brief/Campaign
- no shortlist → shortlist at least one concept
- more than five shortlisted concepts → narrow the production set

## Architecture

- Next.js 16 App Router + TypeScript + React 19
- Tailwind CSS
- PostgreSQL 17 + Drizzle ORM
- Zod domain contracts
- Provider-agnostic AI orchestration
- Deterministic fixture provider
- OpenAI Responses adapter
- PostgreSQL runtime repository
- localStorage DB-free fallback
- IndexedDB source-image Blob storage

## Development

```bash
npm install
npm run dev
```

For PostgreSQL:

```bash
DATABASE_URL=postgresql://...
npm run db:push
```

## Quality gate

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

GitHub Actions provisions PostgreSQL 17, applies the Drizzle schema, and runs the full gate.

v1.1.0 coverage includes:
- canonical Asset Bible keys and counts
- Hero-none / Wardrobe-empty behavior
- shortlist-reference validation
- Asset Bible persistence-failure retry boundary
- DB-backed campaign → shortlist → Asset Bible flow
- PostgreSQL hydration after reload
- Asset Bible generation-job success
- regeneration creating revision 2
- stale detection after shortlist change

## Current boundary

Not included in v1.1.0:
- asset reference-image generation
- scenes
- shotlists
- provider-specific image/video prompting
- video generation
- final assembly

Next milestones:
- v1.2.0: Treatments, scenes, shotlist, prompt compiler
- v1.3.0: Asset reference generation and Continuity Director
- v2.0.0: Video generation, assembly, packshot, cutdowns

## Version

Commercial-Director-v1.1.0
