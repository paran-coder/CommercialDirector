# Commercial Director v1.0.2

Commercial Director is a creative decision system that turns one product image into a campaign foundation and 20 structured advertising directions.

## Product flow

`Product Image → Product Intelligence → Identity Locks → Creative Brief → Campaign Bible → 4 Territories → 20 Concepts → Shortlist → Concept Detail → Slot-level Refinement`

The current product intentionally ends before final image/video rendering. It validates the creative strategy and decision layer first.

## Architecture

- Next.js 16 App Router + TypeScript + React 19
- Tailwind CSS
- PostgreSQL 17 + Drizzle ORM
- Zod domain contracts
- Provider-agnostic AI orchestration
- Deterministic fixture provider
- OpenAI Responses API adapter with Structured Outputs
- PostgreSQL runtime repository as source of truth when `DATABASE_URL` is configured
- localStorage cache/fallback for DB-free development
- IndexedDB Blob storage for the original product image

## AI generation pipeline

1. Product Analyst
2. Campaign Strategist / Art Director
3. Territory Generator
4. Four parallel territory concept batches
5. Deterministic 4 × 5 matrix validation
6. Compact model-level quality review
7. Targeted slot repair

Each territory owns exactly one Narrative, Product Spectacle, Character, Sensory, and Social slot.

### v1.0.2 engine changes

- Individual model calls retry once on transient/structured-output failures.
- The 4 × 5 matrix is validated locally before model-level review.
- Generated concept IDs are canonical: `<territory>-<execution-type>`.
- Quality review omits treatment/pro-detail payload that is not needed for set-level review.
- Slot repair receives same-territory peers plus only the most relevant cross-territory peers.
- A successful AI result is never regenerated solely because persistence commit or job bookkeeping fails.
- Provider-neutral reasoning hints map to OpenAI reasoning effort: strategy/quality tasks use `medium`; high-volume concept generation and repair use `low`.

## Persistence

When `DATABASE_URL` is configured, project creation, product/brief updates, campaign revisions, territories, concepts, shortlist state, concept revisions, and generation jobs are persisted in PostgreSQL. Campaign saves are transactional.

Without a database, the browser fallback remains available for local fixture development.

## Environment

Copy `.env.example` to `.env.local`.

Fixture mode:

```bash
AI_PROVIDER=fixture
```

Real provider mode:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-terra
```

For PostgreSQL runtime:

```bash
DATABASE_URL=postgresql://...
npm run db:push
```

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality gate

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

GitHub Actions additionally provisions PostgreSQL 17 and applies the Drizzle schema before running the gate. Playwright covers the DB-backed product → brief → campaign → 20 concepts → shortlist → concept refinement flow plus deterministic AI-engine tests for matrix structure, bounded model-call retry, and no-regeneration-on-persistence-failure behavior.

The v1.0.2 release candidate passed the full PostgreSQL-backed CI gate on 2026-10-01. A real-provider smoke test remains environment/key-dependent and is not part of the deterministic release gate.

## Version

Commercial-Director-v1.0.2
