import assert from "node:assert/strict";
import test from "node:test";
import type { TreatmentSource } from "./content-types.ts";
import { consolidateTreatmentSources, formatEditorialDate } from "./presentation.ts";

test("editorial dates do not shift into the previous local day", () => {
  assert.equal(formatEditorialDate("2026-07-30T00:00:00Z"), "7/30/2026");
  assert.equal(formatEditorialDate("2026-07-30"), "7/30/2026");
});

test("claim-level source rows render as one document with supported fields", () => {
  const shared = {
    source_title: "Official prescribing information",
    source_url: "https://example.com/label.pdf",
    source_type: "regulatory",
    publication_date: "2026-01-01",
    evidence_level: "primary",
    treatment_id: "treatment-1",
  };
  const sources: TreatmentSource[] = [
    { ...shared, id: "source-1", claim_field: "fda_status" },
    { ...shared, id: "source-2", claim_field: "major_risks" },
    {
      ...shared,
      id: "source-3",
      claim_field: "reversibility",
      source_url: "https://example.com/label.pdf#section-2",
    },
  ];

  const documents = consolidateTreatmentSources(sources);
  assert.equal(documents.length, 1);
  assert.deepEqual(documents[0]?.claim_fields, ["fda_status", "major_risks", "reversibility"]);
});
