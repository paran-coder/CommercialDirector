# Commercial Director v1.1.0 — Context Notes

> Feature branch planning document. v1.0.2 remains the released baseline until v1.1.0 passes the full gate and is merged to main.

## Product thesis
Commercial Director turns one product image into a structured advertising decision system. v1.1.0 adds the production-specification layer that sits between approved creative directions and later scene/shot generation.

## v1.1.0 product goal
Turn a shortlisted set of campaign concepts into one reusable **Asset Bible** containing canonical production specifications for:

1. Product Sheet
2. Hero
3. Wardrobe
4. Locations
5. Props

The Asset Bible is not final media generation. It is a structured source of truth that future scene, shotlist, prompt-compiler, continuity, and rendering stages can reference.

## Why Asset Bible comes after shortlist
The v1.0.x flow intentionally generates campaign strategy and 20 concept directions before production detail. v1.1.0 keeps that principle.

Asset Bible generation requires:
- a completed Campaign Bible,
- the current territory/concept matrix,
- between 1 and 5 shortlisted concepts.

This avoids spending model calls on production assets for directions the user has not chosen and gives the Asset Bible a clear production purpose.

## Source binding and revision semantics
Every Asset Bible revision records:
- the Campaign Bible revision it was derived from,
- the shortlisted concept stable keys used as source,
- creation time,
- the complete structured Asset Bible payload.

Asset Bible generation never silently overwrites an earlier revision. Regeneration appends a new revision.

If the Campaign Bible or shortlist no longer matches the source snapshot of the latest Asset Bible, the UI should show the Asset Bible as **out of date** and offer regeneration.

## Stable asset identity
Downstream production stages must not depend on model-generated names. v1.1.0 therefore uses canonical stable keys created by application code.

Planned key patterns:
- product: `product-main`
- hero: `hero-primary`
- wardrobe: `wardrobe-01`, `wardrobe-02`, ...
- locations: `location-01`, `location-02`, ...
- props: `prop-01`, `prop-02`, ...

Model ordering may change wording, but stable keys remain deterministic inside a revision.

## Asset Bible domain model

### Product Sheet
Exactly one canonical product specification.

Fields include:
- identity statement
- visible identity features that must be preserved
- silhouette/form rules
- materials and surface behavior
- color/marking rules
- scale/handling cues
- preferred hero angles
- unacceptable distortions or substitutions
- continuity locks

The Product Sheet is derived primarily from Product Intelligence and Identity Locks, then contextualized by the Campaign Bible.

### Hero
Exactly one primary hero specification with an applicability state.

Fields include:
- applicability: required / optional / none
- role in campaign
- casting direction
- appearance and grooming
- performance/body-language direction
- relationship to product
- continuity locks
- concept applicability

This keeps the schema usable for categories where a human hero is not essential.

### Wardrobe
Zero to four canonical looks depending on Hero applicability and selected concepts.

Each look includes:
- stable slot
- label
- silhouette
- materials
- palette
- styling notes
- continuity locks
- shortlisted concept references

### Locations
Three to six canonical environments.

Each location includes:
- stable slot
- label
- environment type
- architectural/spatial description
- key materials
- palette
- preferred lighting window
- practical light/environment cues
- continuity locks
- shortlisted concept references

### Props
Two to eight canonical props.

Each prop includes:
- stable slot
- label
- production role
- material/finish
- palette
- handling/use
- placement/staging
- continuity locks
- shortlisted concept references

### Global continuity
The Asset Bible also contains:
- campaign-wide continuity rules
- known conflicts between shortlisted concepts
- production notes for maintaining one coherent world without erasing intentional concept differences

## AI orchestration plan
The Asset Bible is generated through role-specific structured calls rather than one unconstrained prompt.

Planned pipeline:

1. **Product Continuity Director**
   - Product Sheet
   - product-specific continuity constraints

2. **Casting & Styling Director**
   - Hero
   - Wardrobe

3. **Production Designer**
   - Locations
   - Props

The three generation tasks can run in parallel after a compact shared source context is assembled.

After generation:
- application code canonicalizes asset stable keys,
- deterministic validation checks counts, uniqueness, concept references, Hero/Wardrobe compatibility, and required continuity fields,
- one compact cross-asset Quality Review checks campaign coherence and accidental contradictions,
- targeted section repair is allowed with a strict retry/repair bound.

The existing provider abstraction, structured-output validation, bounded model-call retry, and reasoning-effort hints remain in use.

## Input payload discipline
The Asset Bible should not send all Concept Detail prose and Pro Controls to every model call.

Shared source context should include:
- Product Intelligence and Identity Locks
- compact Campaign Bible
- selected concept stable key, title, hook, execution type, product role, and requirements
- territory title/premise where relevant

This keeps generation cost and latency controlled.

## Persistence architecture
Planned PostgreSQL addition:

### `asset_bible_revisions`
- id
- project_id
- revision
- source_campaign_revision
- source_concept_keys (jsonb)
- data (jsonb)
- created_at

Unique constraint: project + revision.

The project repository will expose:
- `saveAssetBible(...)`
- latest Asset Bible hydration through `getProject(...)`
- revision history in the runtime snapshot

Generation job kind will add:
- `asset_bible`

Asset Bible persistence must use the same rule as v1.0.2: a persistence failure after successful model generation must not trigger duplicate AI work.

## Browser fallback
The local project snapshot will gain:
- `assetBible`
- `assetBibleRevisions`

Browser fallback behavior must match server semantics closely enough for fixture/local development, including append-only revisions.

## UI plan
New route:
- `/projects/[projectId]/assets`

Project navigation becomes:
- Product
- Brief
- Campaign
- Concepts
- Assets

This order reflects the actual dependency: choose directions first, then prepare production assets.

### Asset Bible empty states
- No campaign: direct user to Campaign/Brief.
- Campaign exists but shortlist is empty: ask for at least one shortlisted concept.
- More than five shortlisted concepts: ask user to narrow the production set to five or fewer.
- Valid shortlist: show **Build Asset Bible**.

### Asset Bible view
Professional/editorial layout, not an image gallery.

Top section:
- revision
- source campaign revision
- number of shortlisted concepts
- current / out-of-date status
- regenerate action

Sections:
- Product Sheet
- Hero
- Wardrobe
- Locations
- Props
- Global Continuity

Each asset shows its stable key and applicable shortlisted concepts. Pro-level continuity detail is progressively disclosed.

## Non-goals for v1.1.0
- No image generation
- No video generation
- No character reference renders
- No location reference renders
- No wardrobe images
- No prop renders
- No scene graph
- No shotlist
- No provider-specific image prompting
- No timeline/editor
- No automatic final assembly

Those remain later milestones.

## Validation plan
v1.1.0 must pass all existing v1.0.2 gates plus Asset Bible coverage.

Deterministic tests:
- Product Sheet exactly one
- canonical stable keys generated by application code
- Hero applicability contract valid
- Wardrobe count 0–4 and compatible with Hero applicability
- Location count 3–6
- Prop count 2–8
- no duplicate stable keys
- every asset concept reference points to a shortlisted concept
- persistence failure cannot rerun successful Asset Bible generation
- second generation appends revision 2 rather than overwriting revision 1

DB-backed Playwright flow:
- create campaign
- shortlist concepts
- generate Asset Bible
- verify all five sections
- reload/hydrate from PostgreSQL
- verify Asset Bible generation job succeeded
- regenerate and verify revision history
- alter shortlist and verify out-of-date state

Release gate:
- PostgreSQL 17 schema push
- TypeScript
- ESLint
- production Next.js build
- all Playwright tests
- only then PR to main

## Version plan
Current released baseline: Commercial-Director-v1.0.2

Feature under development: Commercial-Director-v1.1.0 — Asset Bible

Next:
- v1.2.0 Treatments, scenes, shotlist, prompt compiler
- v1.3.0 Asset image generation and Continuity Director checks
- v2.0.0 Video generation, assembly, packshot, cutdowns
