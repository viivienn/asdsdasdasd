export type SignupTrigger =
  "save_treatment" | "save_comparison" | "price_update" | "second_comparison" | "header";

export type PendingAccountIntent =
  | {
      type: "save_treatment";
      treatmentId: string;
      nextPath: string;
    }
  | {
      type: "save_comparison";
      treatmentAId: string;
      treatmentBId: string;
      nextPath: string;
    }
  | {
      type: "price_update";
      treatmentId?: string;
      comparisonGroupSlug?: string;
      nextPath: string;
    };

export const PENDING_ACCOUNT_INTENT_KEY = "aesthetic-index:pending-account-intent";
export const SIGNUP_SOURCE_KEY = "aesthetic-index:signup-source";

export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  try {
    const url = new URL(next, "https://aestheticindex.co");
    if (url.origin !== "https://aestheticindex.co") return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}

export function canonicalPair(
  treatmentAId: string,
  treatmentBId: string,
): {
  treatmentAId: string;
  treatmentBId: string;
  pairKey: string;
} {
  const [a, b] =
    treatmentAId.localeCompare(treatmentBId) <= 0
      ? [treatmentAId, treatmentBId]
      : [treatmentBId, treatmentAId];
  return { treatmentAId: a, treatmentBId: b, pairKey: `${a}:${b}` };
}

export function writePendingAccountIntent(intent: PendingAccountIntent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PENDING_ACCOUNT_INTENT_KEY, JSON.stringify(intent));
}

export function readPendingAccountIntent(): PendingAccountIntent | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PENDING_ACCOUNT_INTENT_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingAccountIntent;
    if (
      !parsed ||
      !["save_treatment", "save_comparison", "price_update"].includes(parsed.type) ||
      typeof parsed.nextPath !== "string"
    ) {
      return null;
    }
    return { ...parsed, nextPath: safeNextPath(parsed.nextPath) };
  } catch {
    return null;
  }
}

export function clearPendingAccountIntent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PENDING_ACCOUNT_INTENT_KEY);
}
