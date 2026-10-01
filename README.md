# Commercial Director v1.2.0

Commercial Director is a creative decision system that turns one product image into a campaign foundation, 20 advertising concepts, a reusable Asset Bible, and now a structured production plan for selected concepts.

## Product flow

`Product Image → Product Intelligence → Creative Brief → Campaign Bible → 20 Concepts → Shortlist 1–5 → Asset Bible → Treatments → Scenes → Shotlist → Prompt IR → Provider Prompt`

v1.2.0 does **not** render images or videos. It creates the production structure that later rendering systems consume.

## v1.2.0

For each shortlisted concept with a current Asset Bible:
- 15s treatment
- 30s treatment
- 45s treatment
- Scene Graph
- Shotlist
- model-neutral Prompt IR
- deterministic prompt compilation for Generic / Seedance / Kling / Veo

## Core design constraints

### Stable references
Scenes and shots reference Asset Bible stable keys such as `product-main`, `hero-primary`, `location-01`, and `prop-01`.

Model-generated labels are display text only. Application code owns canonical scene/shot IDs.

### One idea, three durations
15/30/45s treatments must preserve one concept mechanism. Longer durations add pacing, setup, reaction, or payoff room rather than changing the idea.

### Model-neutral first
Prompt IR is the source of truth. Provider compilers only translate syntax/emphasis; they do not invent new production facts.

### Append-only revisions
Production plans are revisioned and bound to their source Campaign revision, Asset Bible revision, shortlist, and shortlisted Concept revision snapshot.

## Production UI

New project navigation:

`Product → Brief → Campaign → Concepts → Assets → Production`

Production view:
- concept selector
- 15/30/45 treatment selector
- Scene Graph
- Shotlist
- optional Pro Controls for Prompt IR/provider prompt inspection
- revision and stale-source status

## Architecture

Existing stack remains:
- Next.js 16 App Router + TypeScript + React 19
- Tailwind CSS
- PostgreSQL 17 + Drizzle ORM
- Zod domain contracts
- provider-agnostic structured AI layer
- deterministic fixture provider
- OpenAI Responses adapter
- PostgreSQL repository + browser fallback
- Playwright DB-backed E2E

## Quality gate

```bash
npm run db:push
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

## Version boundary

v1.2.0:
- production planning
- treatments
- scenes
- shotlists
- prompt compilation

v1.3.0:
- reference asset generation
- generated-media continuity checking

v2.0.0:
- image/video rendering
- shot regeneration
- assembly
- packshot
- social cutdowns

## Version

Commercial-Director-v1.2.0
