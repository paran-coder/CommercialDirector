import type {
  AssetBible,
  AssetBibleReview,
  HeroDraft,
  LocationDraft,
  ProductSheetDraft,
  PropDraft,
  WardrobeDraft,
} from "@/domain/assets/schema";
import { assetBibleSchema } from "@/domain/assets/schema";

export type AssetBibleDraft = {
  productSheet: ProductSheetDraft;
  hero: HeroDraft;
  wardrobe: WardrobeDraft[];
  locations: LocationDraft[];
  props: PropDraft[];
  globalContinuity: AssetBibleReview["globalContinuity"];
};

export type AssetBibleValidationIssue = {
  section: "product" | "hero" | "wardrobe" | "locations" | "props" | "global";
  reason:
    | "invalid_count"
    | "invalid_concept_ref"
    | "duplicate_key"
    | "hero_wardrobe_conflict"
    | "missing_continuity";
  detail: string;
};

export function normalizeAssetBible(draft: AssetBibleDraft): AssetBible {
  return assetBibleSchema.parse({
    productSheet: {
      ...draft.productSheet,
      stableKey: "product-main",
    },
    hero: {
      ...draft.hero,
      stableKey: "hero-primary",
    },
    wardrobe: draft.wardrobe.map((item, index) => ({
      ...item,
      stableKey: indexedKey("wardrobe", index),
    })),
    locations: draft.locations.map((item, index) => ({
      ...item,
      stableKey: indexedKey("location", index),
    })),
    props: draft.props.map((item, index) => ({
      ...item,
      stableKey: indexedKey("prop", index),
    })),
    globalContinuity: draft.globalContinuity,
  });
}

export function validateAssetBible(assetBible: AssetBible, shortlist: string[]) {
  const issues: AssetBibleValidationIssue[] = [];
  const shortlistSet = new Set(shortlist);

  if (assetBible.wardrobe.length > 4) {
    issues.push({ section: "wardrobe", reason: "invalid_count", detail: "Wardrobe must contain at most four looks." });
  }
  if (assetBible.locations.length < 3 || assetBible.locations.length > 6) {
    issues.push({ section: "locations", reason: "invalid_count", detail: "Locations must contain between three and six environments." });
  }
  if (assetBible.props.length < 2 || assetBible.props.length > 8) {
    issues.push({ section: "props", reason: "invalid_count", detail: "Props must contain between two and eight items." });
  }
  if (assetBible.hero.applicability === "none" && assetBible.wardrobe.length > 0) {
    issues.push({ section: "wardrobe", reason: "hero_wardrobe_conflict", detail: "Wardrobe must be empty when Hero applicability is none." });
  }

  const keyedAssets = [
    assetBible.productSheet,
    assetBible.hero,
    ...assetBible.wardrobe,
    ...assetBible.locations,
    ...assetBible.props,
  ];
  const keys = keyedAssets.map((item) => item.stableKey);
  if (new Set(keys).size !== keys.length) {
    issues.push({ section: "global", reason: "duplicate_key", detail: "Asset stable keys must be unique." });
  }

  for (const [section, refs] of collectConceptRefs(assetBible)) {
    for (const ref of refs) {
      if (!shortlistSet.has(ref)) {
        issues.push({
          section,
          reason: "invalid_concept_ref",
          detail: `Asset references non-shortlisted concept ${ref}.`,
        });
      }
    }
  }

  if (assetBible.productSheet.continuityLocks.length < 3) {
    issues.push({ section: "product", reason: "missing_continuity", detail: "Product Sheet requires at least three continuity locks." });
  }
  if (assetBible.globalContinuity.rules.length < 3) {
    issues.push({ section: "global", reason: "missing_continuity", detail: "Global continuity requires at least three rules." });
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

function collectConceptRefs(assetBible: AssetBible): Array<[AssetBibleValidationIssue["section"], string[]]> {
  return [
    ["hero", assetBible.hero.conceptRefs],
    ...assetBible.wardrobe.map((item) => ["wardrobe", item.conceptRefs] as const),
    ...assetBible.locations.map((item) => ["locations", item.conceptRefs] as const),
    ...assetBible.props.map((item) => ["props", item.conceptRefs] as const),
  ];
}

function indexedKey(prefix: "wardrobe" | "location" | "prop", index: number) {
  return `${prefix}-${String(index + 1).padStart(2, "0")}`;
}
