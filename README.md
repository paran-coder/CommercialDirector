# Commercial Director v1.0.1

Commercial Director is a creative decision system that turns one product image into a campaign foundation and 20 structured advertising directions.

## Product flow

`Product Image → Product Intelligence → Identity Locks → Creative Brief → Campaign Bible → 4 Territories → 20 Concepts → Shortlist → Concept Detail → Slot-level Refinement`

v1.0.0 deliberately ends before image/video rendering. It validates the creative strategy and decision layer first.

## Audience

The application serves brand/marketing users and creative/production professionals in one UI. Professional detail is revealed progressively through Pro Controls instead of maintaining separate products.

## Architecture

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- PostgreSQL + Drizzle ORM schema for server persistence
- Zod domain schemas
- Provider-agnostic AI orchestration
- Deterministic fixture provider for local development
- OpenAI Responses API adapter for real structured generation
- PostgreSQL runtime repository as the source of truth when DATABASE_URL is configured
- Browser project snapshot cache/fallback for DB-free prototyping
- IndexedDB blob storage for the uploaded source product image

## AI generation model

The creative engine uses a controlled orchestration workflow rather than autonomous agents chatting with one another:

1. Product Analyst
2. Structured Creative Brief
3. Campaign Strategist / Art Director
4. Territory Generator
5. Four independent Concept Generator jobs, one per territory
6. Heuristic + model Quality Gate
7. Slot-level repair for weak or overlapping concepts

Every territory owns five execution slots: Narrative, Product Spectacle, Character, Sensory, and Social. This yields exactly 20 concepts.

## Concept refinement

Concept Detail supports targeted revision without regenerating the remaining 19 concepts. The first refinement controls are:

- Make it bolder
- Make it more luxurious
- Reduce production complexity
- Make the product more prominent

Local prototype revisions retain the initial concept and every subsequent revision in project history.

## Environment

Copy `.env.example` to `.env.local`.

Fixture mode requires no external AI service:

```bash
AI_PROVIDER=fixture
```

Real AI mode:

```bash
AI_PROVIDER=openai
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.6-terra
```

`DATABASE_URL` enables the PostgreSQL runtime repository. Project creation, product/brief updates, campaign saves, concept revisions, shortlist state, and generation jobs are persisted transactionally. Without a database, the browser fallback remains available for fixture/local development.

## Development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Quality commands

```bash
npm run typecheck
npm run lint
npm run build
npm run test:e2e:install   # once per machine
npm run test:e2e

# full baseline gate
npm run verify
```

## Validation status

GitHub Actions validates every dev/main push against a real PostgreSQL 17 service:

- Drizzle schema push
- TypeScript typecheck
- ESLint
- Next.js production build
- Playwright core-flow E2E
- DB-backed project creation and hydration
- Campaign and concept generation job persistence
- Concept revision persistence
- Shortlist persistence

The v1.0.1 CI gate is passing.

## Version

Commercial-Director-v1.0.1
