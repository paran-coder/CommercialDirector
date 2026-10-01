# Commercial Director v1.0.2 — Implementation Checklist

## Foundation and product flow
- [x] Next.js 16 App Router + TypeScript foundation
- [x] Zod domain contracts
- [x] Provider-agnostic AI interface
- [x] Deterministic fixture provider
- [x] OpenAI Responses API adapter
- [x] Product Intelligence + Identity Locks
- [x] Creative Brief
- [x] Campaign Bible
- [x] 4 territories × 5 execution slots
- [x] 20 Concept Cards
- [x] Shortlist
- [x] Concept Detail + Pro Controls
- [x] Slot-level refinements

## Persistence
- [x] PostgreSQL/Drizzle schema
- [x] DB-first project repository
- [x] Transactional campaign persistence
- [x] Concept revision persistence
- [x] Shortlist persistence
- [x] Generation job state / attempts / failures
- [x] localStorage DB-free fallback
- [x] IndexedDB product-image Blob storage

## v1.0.2 AI engine optimization
- [x] Add per-model-call bounded retry utility
- [x] Separate AI execution retry from persistence commit
- [x] Add strict 4 × 5 structural matrix validation
- [x] Canonicalize generated concept IDs by execution slot
- [x] Compact model-level quality-review payload
- [x] Limit repair peer context to relevant concepts
- [x] Keep repairs targeted and bounded
- [x] Add task-level reasoning effort hints
- [x] Add deterministic AI-engine regression tests
- [x] Verify persistence failure does not rerun successful generation
- [x] Pass final PostgreSQL-backed CI gate

## Validation
- [x] TypeScript typecheck in GitHub Actions
- [x] ESLint in GitHub Actions
- [x] Production Next.js build in GitHub Actions
- [x] PostgreSQL 17 schema push in GitHub Actions
- [x] DB-backed Playwright core flow
- [x] Fixture 4 × 5 matrix regression
- [x] Model-call retry regression
- [x] Persistence-failure non-regeneration regression
- [ ] Real-provider smoke test with API key

## Definition of done for v1.0.2
Completed. The AI engine optimization is implemented and the release candidate passed the full deterministic PostgreSQL-backed CI gate. The live-provider smoke test is explicitly outside the deterministic release gate because it requires external credentials and model usage.
