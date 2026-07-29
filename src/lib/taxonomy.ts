export interface GoalFilter {
  slug: string;
  label: string;
  detail: string;
  keywords: string[];
}

/** Shared "treatment goal" facets used by the Explore menu, Explore page and home page. */
export const GOAL_FILTERS: GoalFilter[] = [
  {
    slug: "expression-lines",
    label: "Expression lines",
    detail: "Frown lines, crow's feet, forehead",
    keywords: ["neuromodulator"],
  },
  {
    slug: "volume-contour",
    label: "Volume & contour",
    detail: "Cheeks, jawline, temples",
    keywords: ["filler", "biostimulator", "collagen stimulator"],
  },
  {
    slug: "lift-tighten",
    label: "Lift & tighten",
    detail: "Skin laxity and firmness",
    keywords: ["energy device"],
  },
  {
    slug: "texture-pores",
    label: "Texture & pores",
    detail: "Surface quality and tone",
    keywords: ["facial", "exfoliation", "microneedling"],
  },
];

export function slugifyType(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function matchesGoal(haystack: string, goalSlug: string) {
  const goal = GOAL_FILTERS.find((item) => item.slug === goalSlug);
  if (!goal) return true;
  const text = haystack.toLowerCase();
  return goal.keywords.some((keyword) => text.includes(keyword));
}
