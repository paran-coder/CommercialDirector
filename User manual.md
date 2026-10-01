# Commercial Director v1.2.0 — User Manual

## 1. Complete Assets first
Production Planning requires a **current** Asset Bible.

Before opening Production:
1. build the Campaign Bible and 20 concepts,
2. shortlist 1–5 concepts,
3. build the Asset Bible,
4. ensure Assets shows **Current**.

If the Campaign Bible or shortlist changes, regenerate the Asset Bible before generating a new Production Plan.

## 2. Open Production
Choose **Production** in the project navigation.

The intended navigation becomes:

`Product → Brief → Campaign → Concepts → Assets → Production`

## 3. Generate the Production Plan
Choose **Build Production Plan**.

Commercial Director generates production planning only for shortlisted concepts.

## 4. Choose a concept
Use the concept selector to switch between shortlisted concepts.

Each concept keeps its own treatments, scenes, shots, and compiled prompt bundles inside the same Production Plan revision.

## 5. Choose 15s, 30s, or 45s
The duration selector changes pacing while preserving the same core concept.

- **15s** — compressed mechanism and payoff
- **30s** — full setup/action/payoff
- **45s** — more atmosphere, performance, product detail, or reaction time

## 6. Review Scene Graph
Each Scene shows:
- canonical scene key
- duration target
- story purpose
- action
- product role
- Asset Bible references
- continuity in/out state
- audio/sound intent

Scenes reference canonical Asset Bible keys rather than free-text recreations.

## 7. Review Shotlist
Expand a Scene to inspect its shots.

Each Shot includes:
- canonical shot key
- timing
- framing
- camera movement
- lens/optical intent
- subject/action
- product visibility
- lighting
- asset references
- continuity notes
- transition intent

## 8. Inspect prompts in Pro Controls
Prompt details are hidden behind Pro Controls by default.

Prompt IR is the model-neutral source of truth. Provider views compile that same structure for:
- Generic cinematic
- Seedance
- Kling
- Veo

Provider compilers may change syntax but should not change the creative facts.

## 9. Revisions
Regeneration creates a new append-only Production Plan revision.

The page will show:
- Production Plan revision
- source Campaign revision
- source Asset Bible revision
- selected concept count
- Current / Out of date state

## 10. Out-of-date behavior
A Production Plan becomes out of date when its bound Campaign, Asset Bible, or shortlist changes.

The previous revision remains available as historical production planning, but a new revision should be generated from the current source.

## 11. What v1.2.0 does not do
This version does not render:
- images
- reference frames
- video clips
- final edits

It produces structured production plans and provider-ready text prompt bundles only.

Reference asset generation is planned for v1.3.0. Actual media generation and assembly are planned for v2.0.0.

## Developer verification

```bash
npm install
npm run db:push
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```
