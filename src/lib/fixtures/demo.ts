import type { CreativeBrief } from "@/domain/brief/schema";
import type { CampaignBible, Territory } from "@/domain/campaign/schema";
import type { Concept, ExecutionType } from "@/domain/concept/schema";
import type { ProductIntelligence } from "@/domain/product/schema";

export const demoProduct: ProductIntelligence = {
  category: "Fragrance",
  subcategory: "Eau de parfum",
  visual: {
    primaryColor: "Deep burgundy",
    secondaryColor: "Champagne gold",
    materials: ["glass", "metal"],
    form: "Tall rectangular bottle",
    finish: ["reflective", "transparent"],
  },
  perception: ["premium", "sensual", "night", "minimal"],
  identityLocks: ["silhouette", "cap", "label", "logo", "product_color"],
  summary: "A premium evening fragrance defined by dark translucent glass, a restrained rectangular silhouette, and warm metallic details.",
  confidence: { category: 0.96, materials: 0.91 },
};

export const demoBrief: CreativeBrief = {
  brandPersonality: ["Luxury", "Minimal", "Sensual"],
  audience: { age: "20–29", gender: "Women", context: "Urban nightlife" },
  coreBenefit: "A fragrance designed for after-dark moments",
  emotionalBenefit: "A memorable presence that lingers after you leave",
  mood: ["Mysterious", "Intimate", "Cinematic"],
  occasion: "Night out",
  constraints: ["Avoid obvious romance clichés", "Keep the product premium, not ornate"],
};

export const demoBible: CampaignBible = {
  campaignName: "AURELIA / NIGHT 01",
  campaignIdea: {
    statement: "Presence remains after you leave.",
    promise: "An after-dark fragrance expressed through traces, reflections, and spaces that keep remembering you.",
  },
  audienceSummary: "Urban women in their twenties who read restraint, fashion fluency, and controlled confidence as modern luxury.",
  visualWorld: {
    keywords: ["quiet luxury", "deep shadow", "wet reflections", "warm metal", "architectural night"],
    avoid: ["generic luxury hotel", "rose petals", "obvious seduction", "ornate excess"],
  },
  hero: { persona: "Quiet confidence", ageRange: "24–30", styling: "Minimal evening tailoring with one warm metallic accent" },
  locations: ["hotel corridor", "night taxi", "rooftop", "private listening bar"],
  props: ["mirror", "cocktail glass", "black leather bag", "brass key tag"],
  productBehavior: ["reflection", "shadow", "light refraction", "condensation", "macro glass texture"],
  cameraLanguage: ["controlled dolly", "compressed portrait lens", "macro product inserts", "rare handheld emotional peak"],
  lighting: ["low-key practicals", "warm tungsten points", "specular edge light", "wet-surface reflections"],
  palette: ["black", "burgundy", "champagne gold", "warm skin", "smoke grey"],
  soundLanguage: ["close room tone", "low pulse", "isolated heel detail", "soft mechanical ambience"],
};

export const demoTerritories: Territory[] = [
  { id: "after-dark", slot: 1, title: "AFTER DARK", premise: "The fragrance heightens ordinary night spaces.", description: "Familiar urban spaces subtly become more charged, precise, and cinematic the moment the fragrance enters them." },
  { id: "the-trace", slot: 2, title: "THE TRACE", premise: "Her presence remains after she leaves.", description: "Reflections, light, sound, and other people carry a residual trace, turning absence into the product's most memorable proof." },
  { id: "private-ritual", slot: 3, title: "PRIVATE RITUAL", premise: "Applying the fragrance begins the night.", description: "Small preparation gestures gain ceremonial weight, making the product the threshold between private composure and public presence." },
  { id: "magnetism", slot: 4, title: "MAGNETISM", premise: "The environment subtly moves toward her.", description: "Objects, attention, architecture, and light respond with restrained attraction rather than overt fantasy." },
];

const names: Record<string, Array<[string, string]>> = {
  "after-dark": [
    ["City After Midnight", "The city becomes more precise when she steps into it."],
    ["Liquid Night", "Burgundy light travels through the bottle and redraws the room."],
    ["One Table Left", "A quiet entrance changes the temperature of a nearly empty bar."],
    ["Night Air", "The fragrance is felt as a shift in texture, breath, and light."],
    ["11:47 PM", "A sequence of social micro-moments makes midnight feel like her medium."],
  ],
  "the-trace": [
    ["Last Elevator", "The elevator remembers her."],
    ["Gold Residue", "A fine line of warm light remains wherever the bottle has been."],
    ["Second Look", "People turn only after she has already passed."],
    ["The Empty Seat", "A vacant taxi seat still feels occupied by her presence."],
    ["Seen After", "Friends reconstruct a night through the places she has just left."],
  ],
  "private-ritual": [
    ["Before the Door", "The decisive moment happens before she leaves home."],
    ["Three Drops of Night", "Macro product details turn application into controlled choreography."],
    ["No Audience", "Confidence is established alone, without a mirror performance."],
    ["Pulse Points", "Sound, skin, glass, and fabric make application almost tactile."],
    ["Ready in Silence", "A quiet vertical-film ritual refuses the usual get-ready montage."],
  ],
  magnetism: [
    ["The Long Way Through", "A room subtly reorganizes around her path."],
    ["Metal Finds Light", "Warm metallic surfaces catch the bottle before the camera does."],
    ["Orbit", "People never crowd her; they simply keep finding her in their eyeline."],
    ["Gravity Test", "Tiny objects react as if the fragrance has its own field."],
    ["Pull", "A sequence of restrained reactions turns attraction into a visual system."],
  ],
};

const executionTypes: ExecutionType[] = ["narrative", "product_spectacle", "character", "sensory", "social"];

export const demoConcepts: Concept[] = demoTerritories.flatMap((territory, territoryIndex) =>
  names[territory.id].map(([title, hook], index) => ({
    id: `concept-${String(territoryIndex * 5 + index + 1).padStart(2, "0")}`,
    territoryId: territory.id,
    executionType: executionTypes[index],
    title,
    hook,
    idea: index === 0 && territory.id === "the-trace"
      ? "A woman enters an empty mirrored elevator, exits on another floor, and leaves behind one impossible reflection for a beat too long. The lingering image resolves into the bottle's reflective glass language rather than a supernatural effect."
      : `${hook} The execution uses ${territory.description.toLowerCase()} Product presence is integrated as the cause of the visual behavior rather than added as a final interruption.`,
    productRole: "The bottle is the visual source of the campaign mechanism and receives a deliberate product moment before the closing frame.",
    audienceTakeaway: territory.premise,
    primaryDuration: 15,
    treatment15s: [
      { time: "0–3s", beat: "Establish one precise visual behavior and the world before the product is explained." },
      { time: "3–9s", beat: "Escalate the territory mechanism through the hero, environment, or product material." },
      { time: "9–13s", beat: "Connect the behavior clearly back to the fragrance." },
      { time: "13–15s", beat: "Controlled packshot and campaign line." },
    ],
    requirements: {
      hero: index !== 1,
      locations: [demoBible.locations[territoryIndex]],
      props: index === 1 ? ["reflective surface"] : [demoBible.props[territoryIndex]],
      vfx: index === 3 ? ["subtle environmental response"] : [],
    },
    pro: {
      creativeRationale: `The concept turns ${territory.premise.toLowerCase()} into a single visible mechanism that can be recognized without explanatory dialogue.`,
      camera: demoBible.cameraLanguage.slice(0, 3),
      lighting: demoBible.lighting.slice(0, 3),
      continuity: ["Preserve bottle silhouette and label", "Keep wardrobe unchanged within the film", "Maintain warm-metal highlight logic"],
    },
  })),
);

export const demoProject = {
  id: "demo-aurelia",
  brandName: "Aurelia",
  productName: "No. 7 Eau de Parfum",
  status: "20 concepts",
  updatedAt: "18 min ago",
};
