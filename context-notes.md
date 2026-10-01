# Commercial Director v1.2.0 — Context Notes

## Product thesis
Commercial Director is a creative decision system. v1.2.0 turns the selected campaign direction and Asset Bible into a production plan that can later drive image/video generation without re-inventing continuity at prompt time.

## v1.2.0 scope
Input:
- current Product Intelligence
- current Campaign Bible
- current shortlist (1–5 concepts)
- current Asset Bible

Output per shortlisted concept:
- 15s treatment
- 30s treatment
- 45s treatment
- Scene Graph
- Shotlist
- model-neutral Prompt IR
- compiled prompt bundles for supported providers

No image/video rendering is added in this version.

## Dependency rule
Production Planning is generated **after** a current Asset Bible exists.

The source binding must include:
- source Campaign Bible revision
- source Asset Bible revision
- source shortlisted concept stable keys
- source shortlisted Concept revision snapshot

A production plan becomes stale when any bound source changes.

## Production hierarchy

`Concept → Treatment → Scene → Shot → Prompt IR → Provider Compiler`

### Treatments
Each shortlisted concept receives three timing variants:
- 15 seconds
- 30 seconds
- 45 seconds

Treatments preserve the same core idea while changing pacing and beat density. They are not three unrelated concepts.

### Scene Graph
A Scene is a causal story unit, not just a location change.

Each scene must include:
- canonical scene key assigned by application code
- concept key
- duration target
- story purpose
- action
- product role
- asset references by stable key
- continuity in/out state
- audio/sound intent

### Shotlist
A Shot belongs to exactly one scene and includes:
- canonical shot key assigned by application code
- timing
- framing
- camera movement
- lens/optical intent
- subject/action
- product visibility
- lighting intent
- asset references
- continuity notes
- transition intent

Shot duration totals must remain compatible with the selected treatment duration.

## Stable production identity
Model output never owns canonical identifiers.

Application code assigns:
- `treatment-<concept>-15`
- `treatment-<concept>-30`
- `treatment-<concept>-45`
- `scene-<concept>-<duration>-01`
- `shot-<concept>-<duration>-01-01`

All asset references must use v1.1.0 Asset Bible keys such as `product-main`, `hero-primary`, `location-01`, and `prop-01`.

## Prompt architecture
Prompt generation is split into two layers.

### Prompt IR
A model-neutral structured representation containing:
- subject
- action
- environment
- product continuity
- hero/wardrobe continuity
- prop continuity
- framing
- lens/camera
- lighting
- motion
- temporal behavior
- negative constraints
- continuity carry-over

### Provider Compiler
A deterministic compiler converts Prompt IR into provider-specific text/parameter bundles.

The compiler may change syntax and emphasis but must not add new creative facts.

Initial compiler targets:
- generic cinematic
- Seedance
- Kling
- Veo

Provider output remains text-only in v1.2.0.

## Generation strategy
Generation is concept-scoped so one bad concept does not invalidate all selected concepts.

Planned role separation:
1. Treatment Director
2. Scene Director
3. Shot Director
4. Production Continuity Reviewer

Treatment generation may run in parallel across shortlisted concepts. Scene/shot generation is sequential within one concept because downstream structure depends on upstream timing and continuity.

## Deterministic validation
The application validates:
- source bindings
- treatment duration variant presence
- scene/shot canonical key uniqueness
- scene and shot concept ownership
- all asset refs exist in current Asset Bible
- no Hero/Wardrobe refs when Hero applicability is none
- shot timing monotonicity
- positive shot durations
- shot duration sum within tolerance of treatment duration
- every scene has at least one shot
- every shot belongs to a generated scene
- Prompt IR references the same shot/assets it was derived from

Invalid groups are repaired at the smallest safe scope.

## Persistence
Use append-only `production_plan_revisions` per project.

Each revision stores:
- source Campaign revision
- source Asset Bible revision
- source concept keys
- source concept revision snapshot
- complete structured production plan
- created time

Generation kind: `production_plan`.

## UI
Add project navigation item: **Production**.

Route:
`/projects/[projectId]/production`

The page should act like a director/producer document, not a render gallery.

Expected UX:
- prerequisite state when Asset Bible is missing or stale
- concept selector for shortlisted concepts
- 15 / 30 / 45 treatment selector
- Scene Graph overview
- expandable Shotlist
- Prompt IR / compiled prompt inspection behind Pro Controls
- revision/source status
- regenerate production plan

## Explicitly deferred
- reference image generation — v1.3.0
- automatic visual continuity checking against generated media — v1.3.0
- actual image/video generation — v2.0.0
- timeline assembly/editing — v2.0.0
