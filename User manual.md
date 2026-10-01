# Commercial Director v1.1.0 — User Manual

## 1. Build the campaign
Start from one product image, review Product Intelligence and Identity Locks, complete the Creative Brief, then build the Campaign Bible and 20 concepts.

## 2. Shortlist production directions
Open **Concepts** and shortlist between **1 and 5 concepts**.

Asset Bible intentionally uses only selected concepts. If none are selected, Assets asks you to return to Concepts. If more than five are selected, narrow the production set first.

## 3. Open Assets
Choose **Assets** in the project navigation.

The navigation order is:

`Product → Brief → Campaign → Concepts → Assets`

Choose **Build Asset Bible**.

## 4. Review Product Sheet
Product Sheet is the primary product-continuity contract.

It records:
- identity statement
- features to preserve
- form rules
- materials/surface behavior
- color/marking rules
- scale and handling
- preferred hero angles
- prohibited substitutions/distortions
- continuity locks

Its stable key is `product-main`.

## 5. Review Hero
Hero records whether a recurring human/character presence is:
- required
- optional
- none

It also defines casting, grooming, performance, product relationship, continuity locks, and applicable shortlisted concepts.

Stable key: `hero-primary`.

If Hero is `none`, Wardrobe is empty.

## 6. Review Wardrobe
Wardrobe contains zero to four reusable looks.

Each look includes:
- canonical stable key
- silhouette
- materials
- palette
- styling notes
- continuity locks
- applicable shortlisted concepts

## 7. Review Locations
The Asset Bible defines three to six reusable environments.

Each location includes spatial character, materials, palette, lighting window, practical cues, continuity locks, and concept applicability.

## 8. Review Props
The Asset Bible defines two to eight canonical production props.

Each prop includes its production role, material/finish, palette, handling, staging, continuity locks, and applicable shortlisted concepts.

## 9. Review Global Continuity
Global Continuity separates:
- campaign-wide rules that should remain consistent,
- intentional differences/conflicts that should remain distinct,
- practical production notes.

## 10. Revisions
Every generation creates an Asset Bible revision.

The page shows:
- Asset Bible revision
- source Campaign revision
- number of selected concepts
- Current / Out of date status

Choose **Regenerate** to append a new revision. Previous revisions are retained.

## 11. Out-of-date status
If the Campaign Bible or shortlist changes after an Asset Bible was generated, the previous Asset Bible is preserved but marked **Out of date**.

Generate again to create a new revision from the current campaign and shortlist.

## 12. What v1.1.0 does not do
Asset Bible is a structured production specification. It does not yet create:
- product reference renders
- Hero images
- wardrobe images
- location images
- prop images
- scenes
- shotlists
- videos

Scenes/shotlists arrive in v1.2.0. Reference asset generation arrives in v1.3.0.

## Persistence
With `DATABASE_URL` configured, Asset Bible revisions and generation jobs are stored in PostgreSQL.

Without PostgreSQL, browser fallback preserves the same append-only revision model for local/fixture development.

## Developer verification

```bash
npm install
npm run db:push
npm run typecheck
npm run lint
npm run build
npm run test:e2e
```

GitHub Actions runs the same gate against PostgreSQL 17.
