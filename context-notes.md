# Commercial Director v1.0.2 — Context Notes

## Product thesis
Commercial Director turns one product image into a structured advertising decision system. The product deliberately validates creative strategy and concept selection before expensive media generation.

## Primary users
- Brand / marketer: guided decisions and clear concepts with little production jargon.
- Creative / production professional: the same project data with progressively disclosed production controls.

## Core promise
One product image → Product Intelligence → Creative Brief → Campaign Bible → 4 Creative Territories → 20 Campaign Concepts → Shortlist → Concept Detail.

## Success criterion
The core product metric is shortlisted concepts / generated concepts. The creative engine should produce a set diverse enough that users want to develop multiple directions rather than choose among paraphrases.

## Product principles
1. Better decisions over more generations.
2. Build a reusable campaign world before executions.
3. Preserve product identity explicitly through Identity Locks.
4. Enforce structural diversity before asking a model to judge quality.
5. Version AI outputs; never silently overwrite revisions.
6. Keep provider-specific code behind adapters.
7. Keep the interface restrained and professional.
8. Use progressive disclosure rather than separate beginner/pro products.

## Current scope
Included:
- Product upload and Product Intelligence
- Identity Locks
- Creative Brief
- Campaign Bible
- 4 territories × 5 execution slots
- 20 Concept Cards
- Shortlist
- Concept Detail + Pro Controls
- Slot-level refinement
- PostgreSQL runtime persistence
- Generation-job history and retry state
- Fixture and OpenAI provider paths

Excluded:
- Final image/video rendering
- Asset bible generation
- Timeline/editor
- Audio generation
- Social publishing
- Billing and team permissions

## Persistence architecture
PostgreSQL is the source of truth whenever `DATABASE_URL` is configured. The repository layer persists projects, briefs, campaign revisions, territories, concepts, shortlist state, concept revisions, and generation jobs. Campaign creation commits campaign revision + territories + concepts + initial concept revisions transactionally.

localStorage remains a typed browser cache and DB-free fallback. IndexedDB stores the original uploaded image Blob.

## AI provider rule
`AIProvider` owns model invocation only. Domain orchestration owns schemas, prompts, retries, structural validation, quality review, and repair planning.

Modes:
- `AI_PROVIDER=fixture`: deterministic, no API key.
- `AI_PROVIDER=openai`: Responses API + Structured Outputs.

## v1.0.2 AI engine optimization
- Added bounded per-model-call retry for transient and malformed structured output failures.
- Kept whole-generation retry as a last-resort boundary while preventing persistence errors from rerunning successful AI work.
- Added deterministic exact 4 × 5 matrix validation, including missing/duplicate execution slots and territory counts.
- Canonicalized concept IDs from territory + execution type so slot identity is independent of model ordering.
- Reduced quality-review payload to the fields needed for set-level evaluation.
- Reduced repair context to compact campaign data, same-territory peers, and the most similar outside peers.
- Kept repairs capped at six slots per quality pass.
- Added provider-neutral reasoning effort hints; OpenAI maps them to Responses API reasoning effort.
- Added deterministic Playwright/Node regression coverage for matrix validity, malformed-output retry, and persistence-failure non-regeneration.

## Validation
GitHub Actions provisions PostgreSQL 17, runs `db:push`, then typecheck, ESLint, production build, and Playwright. v1.0.1 passed this full DB-backed gate. v1.0.2 release approval requires the same final gate after all engine changes.

## Future milestones
- v1.1.0: Product/Hero/Wardrobe/Location/Prop asset bible
- v1.2.0: Treatments, scenes, shotlist, prompt compiler
- v1.3.0: Asset generation and continuity checks
- v2.0.0: Video generation, assembly, packshot, cutdowns
