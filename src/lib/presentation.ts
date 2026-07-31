import type { TreatmentSource } from "@/lib/content-types";

/**
 * Review and research dates are editorial calendar dates, not moments in the
 * visitor's local timezone. Formatting them in UTC prevents midnight UTC from
 * appearing as the previous day in North American timezones.
 */
export function formatEditorialDate(value: string): string {
  const dateOnly = value.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  const date = new Date(dateOnly ? `${dateOnly}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export type ConsolidatedTreatmentSource = TreatmentSource & {
  claim_fields: string[];
};

/**
 * Claim-level source rows intentionally repeat a document when it supports
 * several treatment fields. Public bibliographies should list each document
 * once while retaining how many fields it supports.
 */
export function consolidateTreatmentSources(
  sources: readonly TreatmentSource[],
): ConsolidatedTreatmentSource[] {
  const byDocument = new Map<string, ConsolidatedTreatmentSource>();

  for (const source of sources) {
    const key = normalizedSourceKey(source.source_url);
    const existing = byDocument.get(key);
    if (existing) {
      if (!existing.claim_fields.includes(source.claim_field)) {
        existing.claim_fields.push(source.claim_field);
      }
      existing.publication_date ??= source.publication_date;
      existing.evidence_level ??= source.evidence_level;
      continue;
    }

    byDocument.set(key, {
      ...source,
      claim_fields: source.claim_field ? [source.claim_field] : [],
    });
  }

  return [...byDocument.values()].sort(
    (a, b) =>
      a.source_title.localeCompare(b.source_title) || a.source_url.localeCompare(b.source_url),
  );
}

function normalizedSourceKey(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.hash = "";
    parsed.hostname = parsed.hostname.toLowerCase().replace(/^www\./, "");
    parsed.pathname = parsed.pathname.replace(/\/+$/, "") || "/";
    return parsed.toString();
  } catch {
    return url.trim().toLowerCase();
  }
}
