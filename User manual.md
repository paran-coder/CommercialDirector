# Commercial Director v1.1.0 — User Manual Plan

> This describes the intended v1.1.0 Asset Bible workflow. The released main branch remains v1.0.2 until implementation and CI are complete.

## Existing workflow
Users first:
1. upload and analyze the product,
2. complete the Creative Brief,
3. build the Campaign Bible and 20 concepts,
4. shortlist the directions worth developing.

## New v1.1.0 step — Build Asset Bible
After shortlisting between **1 and 5 concepts**, open **Assets** in project navigation.

If no concepts are shortlisted, Commercial Director asks you to return to Concepts and select at least one direction.

If more than five concepts are shortlisted, narrow the production set before generation. This keeps the Asset Bible specific enough to be useful in production.

Choose **Build Asset Bible**.

## Product Sheet
Product Sheet is the highest-priority continuity reference.

It records:
- product identity statement
- silhouette/form rules
- visible features that must remain unchanged
- materials and finish
- color and marking rules
- scale and handling cues
- preferred hero angles
- things the production system must not alter

Future scene and rendering stages will use these constraints to protect product identity.

## Hero
Hero defines the primary human/character presence where relevant.

It records:
- whether a hero is required, optional, or not needed
- campaign role
- casting direction
- appearance/grooming direction
- performance/body language
- relationship to the product
- continuity locks
- which shortlisted concepts use the hero

A non-human product category can legitimately use `none`.

## Wardrobe
Wardrobe contains up to four production looks when a Hero is applicable.

Each look defines:
- silhouette
- materials
- palette
- styling notes
- continuity locks
- applicable shortlisted concepts

If Hero is `none`, Wardrobe remains empty.

## Locations
The Asset Bible defines three to six reusable environments.

Each location records:
- environment type
- architecture/spatial character
- materials
- palette
- preferred lighting window
- practical lighting/environment cues
- continuity locks
- applicable shortlisted concepts

## Props
The Asset Bible defines two to eight canonical props.

Each prop records:
- its role
- material/finish
- palette
- handling/use
- placement/staging
- continuity locks
- applicable shortlisted concepts

## Global Continuity
Global Continuity captures campaign-wide rules and conflicts.

It distinguishes:
- details that should remain consistent across all selected concepts,
- deliberate differences that should remain different,
- potential conflicts that production should not accidentally blend together.

## Revisions
Every generated Asset Bible is a revision.

The revision remembers:
- the Campaign Bible revision it came from,
- exactly which shortlisted concepts it was built for.

Regenerating creates a new revision; the previous revision is retained.

If the shortlist or Campaign Bible later changes, Assets shows the current Asset Bible as **out of date** rather than pretending it still matches the project.

## What v1.1.0 still does not generate
Asset Bible is a production specification layer, not final media.

v1.1.0 does not produce:
- product reference renders
- character images
- wardrobe images
- location images
- prop images
- scenes
- shotlists
- videos

Reference media comes later in v1.3.0. Scenes and shotlists begin in v1.2.0.

## Developer acceptance
The implementation is accepted only after PostgreSQL 17 schema push, typecheck, lint, production build, and the complete Playwright suite pass. Asset Bible E2E must verify generation, persistence, revision history, and source-change/out-of-date behavior.
