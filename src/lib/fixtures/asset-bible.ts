import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";
import type {
  AssetBibleReview,
  HeroDraft,
  LocationDraft,
  ProductSheetDraft,
  PropDraft,
  WardrobeDraft,
} from "@/domain/assets/schema";

export function createAssetBibleFixture(input: {
  product: ProductIntelligence;
  bible: CampaignBible;
  territories: Territory[];
  concepts: Concept[];
  shortlist: string[];
}) {
  const selected = input.concepts.filter((concept) => input.shortlist.includes(concept.id));
  const refs = selected.map((concept) => concept.id);
  const heroRefs = selected.filter((concept) => concept.requirements.hero).map((concept) => concept.id);
  const heroNeeded = heroRefs.length > 0;
  const locationRefs = new Map<string, string[]>();
  const propRefs = new Map<string, string[]>();

  for (const concept of selected) {
    for (const location of concept.requirements.locations) {
      locationRefs.set(location, [...new Set([...(locationRefs.get(location) ?? []), concept.id])]);
    }
    for (const prop of concept.requirements.props) {
      propRefs.set(prop, [...new Set([...(propRefs.get(prop) ?? []), concept.id])]);
    }
  }

  const productSheet: ProductSheetDraft = {
    identityStatement: input.product.summary,
    preserve: [
      "Preserve the approved silhouette and overall proportions.",
      "Preserve visible cap, label, logo, and product-color relationships.",
      "Keep all visible identity-lock features recognizable in every setup.",
    ],
    formRules: [
      `Maintain the original ${input.product.visual.form.toLowerCase()} geometry.`,
      "Do not stretch, compress, taper, or stylize the pack shape between shots.",
    ],
    materialsAndSurface: [
      ...input.product.visual.materials.map((material) => `Render ${material} with physically plausible surface response.`),
      ...input.product.visual.finish.map((finish) => `Preserve the ${finish} finish behavior under changing light.`),
    ].slice(0, 8),
    colorAndMarkingRules: [
      `Primary product color remains ${input.product.visual.primaryColor}.`,
      `Secondary product color remains ${input.product.visual.secondaryColor}.`,
      "Keep label/logo placement and contrast consistent with the source product.",
    ],
    scaleAndHandling: [
      "Keep bottle scale consistent relative to hand and tabletop references.",
      "Handling must feel premium and deliberate rather than weightless or toy-like.",
    ],
    heroAngles: [
      "Three-quarter front angle that preserves silhouette and label readability.",
      "Controlled side angle for material and reflective behavior.",
      "Macro detail only when it remains anatomically consistent with the full product.",
    ],
    avoid: [
      "Do not invent secondary packaging, closures, labels, or accessories.",
      "Do not alter proportions for dramatic perspective.",
      "Do not replace source materials with generic plastic or chrome.",
    ],
    continuityLocks: [
      "Silhouette",
      "Cap geometry",
      "Label and logo placement",
      "Primary/secondary product colors",
      "Material finish",
    ],
  };

  const hero: HeroDraft = {
    applicability: heroNeeded ? "required" : "none",
    role: heroNeeded ? input.bible.hero.persona : "No human hero is required for the selected concepts.",
    castingDirection: heroNeeded ? `${input.bible.hero.ageRange}; ${input.bible.hero.persona}.` : "Not applicable.",
    appearanceAndGrooming: heroNeeded ? "Controlled, contemporary grooming with understated finish and no distracting statement details." : "Not applicable.",
    performanceDirection: heroNeeded ? "Restrained confidence, precise movement, and no overt beauty-ad posing." : "Not applicable.",
    relationshipToProduct: heroNeeded ? "The hero treats the product as an intentional personal object; handling is specific, calm, and causally linked to the concept." : "Product carries the visual narrative without a human lead.",
    continuityLocks: heroNeeded
      ? ["Casting identity", "Hair shape", "Makeup finish", "Jewelry family", "Performance restraint"]
      : ["No human hero introduced unless the Asset Bible is regenerated."],
    conceptRefs: heroNeeded ? heroRefs : refs,
  };

  const wardrobe: WardrobeDraft[] = heroNeeded ? [{
    label: "Primary evening look",
    silhouette: "Minimal tailored evening silhouette with clean vertical lines and controlled volume.",
    materials: ["matte tailoring", "silk or satin accent"],
    palette: input.bible.palette.slice(0, 4),
    stylingNotes: ["One warm metallic accent", "No visible logos", "Keep styling modern rather than ornate"],
    continuityLocks: ["Same core look within a concept", "Metal accent family remains consistent"],
    conceptRefs: heroRefs,
  }] : [];

  const fallbackLocations = input.bible.locations.slice(0, 3);
  const locationEntries = [...locationRefs.entries()];
  const locationNames = [...new Set([...locationEntries.map(([name]) => name), ...fallbackLocations])].slice(0, 6);
  while (locationNames.length < 3) locationNames.push(`Campaign environment ${locationNames.length + 1}`);

  const locations: LocationDraft[] = locationNames.map((label) => ({
    label,
    environmentType: label,
    spatialDescription: `A controlled ${label.toLowerCase()} interpretation inside the campaign's ${input.bible.visualWorld.keywords.slice(0, 3).join(", ")} visual world.`,
    materials: ["dark architectural surfaces", "select reflective details"],
    palette: input.bible.palette.slice(0, 5),
    lightingWindow: input.bible.lighting[0] ?? "controlled low-key lighting",
    practicalCues: input.bible.lighting.slice(0, 3),
    continuityLocks: ["Material family", "Palette", "Practical-light logic", "Degree of reflectivity"],
    conceptRefs: locationRefs.get(label) ?? refs,
  }));

  const fallbackProps = input.bible.props.slice(0, 2);
  const propEntries = [...propRefs.entries()];
  const propNames = [...new Set([...propEntries.map(([name]) => name), ...fallbackProps])].slice(0, 8);
  while (propNames.length < 2) propNames.push(`Campaign prop ${propNames.length + 1}`);

  const props: PropDraft[] = propNames.map((label) => ({
    label,
    productionRole: "Supports the selected concept mechanism without competing with the product.",
    materialAndFinish: "Premium, restrained finish consistent with the campaign material language.",
    palette: input.bible.palette.slice(0, 3),
    handlingAndUse: "Use only when motivated by the selected concept action.",
    placementAndStaging: "Stage with deliberate negative space and keep the product visually dominant.",
    continuityLocks: ["Material finish", "Scale", "Placement logic"],
    conceptRefs: propRefs.get(label) ?? refs,
  }));

  const review: AssetBibleReview = {
    globalContinuity: {
      rules: [
        "Product identity locks override decorative concept styling.",
        "Warm-metal and burgundy cues should recur without making every location identical.",
        "Selected concepts may vary in mechanism, but camera restraint and premium material response remain consistent.",
      ],
      conflicts: [],
      productionNotes: [
        "Carry one controlled reflective logic across product, props, and environments.",
        "Do not flatten intentional territory differences while maintaining product and hero continuity.",
      ],
    },
    issues: [],
  };

  return { productSheet, hero, wardrobe, locations, props, review };
}
