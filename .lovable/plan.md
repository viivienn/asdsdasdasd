## What I verified first

- `treatments` has no entity-type or image columns. It carries `category` (free text: "Neuromodulator", "Dermal filler", "Biostimulator / filler", "Energy device", "Facial / exfoliation"), `treatment_class`, `brand_name`, `generic_name`, plus ~30 editorial text fields.
- 10 treatment rows exist. 8 are `is_sample = true` with `evidence_grade = 'Not yet sourced'` and null `last_reviewed_at`; only `hydrafacial` and `diamondglow` are real and reviewed.
- 6 comparison rows exist. Only `hydrafacial-vs-diamondglow` is non-sample and reviewed; the other five are sample rows, so they currently render the "Editorial review in progress" branch and are `noindex`.
- `compare.$slug.tsx` is 736 lines: bottom line, on-page nav, quick table, three "consider when" cards, 8 detailed section tables, cost, local prices, misconception, consultation questions, sources-by-claim, disclaimer, related, coverage form.
- No `/explore` route exists. `search-index.ts` already models categories/brands/treatments/comparisons but as a hardcoded client-side list, disconnected from the database.
- Indexability today is gated by `getComparisonContext`'s `reviewed` boolean and `isDemo` from the dual-read path in `content.server.ts`; the sitemap only lists reviewed/non-sample rows.

Assumption I'm making: sample rows stay in the database as working drafts. They become invisible publicly (no links, no listings, noindex) rather than being deleted, so the editorial pipeline still has something to fill in.

---

## Smallest safe schema migration

One migration, additive only — no column drops, no data loss.

**1. `treatments` gains entity typing**

- `entity_type` enum `treatment_entity_type`: `class` | `brand_family` | `product` | `device` | `procedure`. Not null, default `product`, backfilled per row (e.g. `ha-filler` → `class`, `juvederm` → `brand_family`, `juvederm-voluma` → `product`, `ultherapy`/`thermage`/`morpheus8` → `device`, `hydrafacial` → `procedure`).
- `parent_id uuid references treatments(id)` — product → brand family → class. Lets Voluma inherit Juvéderm's family and the HA-filler class.
- `manufacturer text` — separates maker from brand name.
- `sort_rank int not null default 0` for catalog ordering.
- `at_a_glance jsonb` — small typed object powering the visual summary (score-free: onset, duration, downtime band, pain band, reversibility, adds-volume/tightening flags). No new prose fields.

**2. New `treatment_media` table** (imagery with rights)

Columns: `treatment_id`, `url`, `alt_text`, `media_role` (`product_shot` | `device` | `diagram`), `credit`, `source_url`, `license` (`manufacturer_press` | `cc_by` | `cc_by_sa` | `licensed` | `own_work`), `license_url`, `rights_verified_at`, `publication_status`, `is_sample`, timestamps.
Grants → enable RLS → public SELECT only where `publication_status='published' AND is_sample=false AND rights_verified_at is not null`; admin full access via `private.has_role`. No image is ever rendered without a credit and verified rights.

**3. `comparisons` gains `row_template text`**

Values: `neuromodulator_brands`, `filler_families`, `filler_products`, `lifting_devices`, `resurfacing_devices`, `cross_category`. Nullable; when null the app derives the template from the two entity types (see below), so no backfill is mandatory.

That's it — no table renames, no changes to `price_observations`, `treatment_sources`, RLS helpers, or submission tables.

---

## Comparison row templates

New `src/lib/comparison-templates.ts` replacing the single fixed `COMPARISON_ROWS` / `COMPARISON_SECTIONS` pair:

- `resolveTemplate(a, b)` — uses `comparisons.row_template` when set, otherwise derives from `entity_type` + `category` of both records; falls back to `cross_category`.
- Each template defines: 4–6 **glance** attributes (the visual summary) and grouped **detail** rows.
  - `neuromodulator_brands`: units/dosing basis, onset, peak, duration, spread characteristics, diffusion, protein load, approved areas.
  - `filler_families`: base material, family breadth, crosslinking approach, typical areas, longevity range, reversibility.
  - `filler_products`: G-prime/firmness descriptor, indicated area, typical volume, longevity, lidocaine, reversibility.
  - `lifting_devices`: energy type, tissue depth, sessions, discomfort, downtime, onset, durability.
  - `resurfacing_devices`: mechanism, depth, sessions, downtime, redness, skin-tone considerations.
  - `cross_category`: the current generic set, trimmed.
- Cross-category renders an explicit "these are not like-for-like" line instead of pretending row parity.

---

## Route and component changes

**Simplified comparison page — `src/routes/compare.$slug.tsx`**

Cut from ~736 lines to a thin route plus components. New order:

1. Breadcrumb + H1 + reviewed date badge
2. **Glance card** (`src/components/comparison-glance.tsx`) — two columns, imagery when licensed media exists, one-line difference, and 4–6 template attributes as short labelled values. No scores, no color-only meaning.
3. **"Choose A when / Choose B when / Neither"** — three compact cards, kept
4. **Expandable details** (`src/components/comparison-details.tsx`) — one `<details>` per section, semantic `<table>` inside, claim-level sources inline. Server-rendered inside `<details>` so SSR content is still in the HTML for crawlers; first section open by default.
5. Local prices link, sources, medical disclaimer, related comparisons

Removed from the page: the long on-page nav, the duplicate quick-vs-detailed double table, the "cost" essay, the "questions to ask at consultation" block (moved to `/methodology`), and the review-request form on the unreviewed branch.

**Explore — new `src/routes/explore.index.tsx` (+ `explore.$type.$slug.tsx` for class/brand hubs)**

Server-loaded catalog grouped by `entity_type`: Classes · Brand families · Products · Devices · Procedures, with a secondary category filter. Each card shows name, parent chain, and licensed thumbnail if present. Only published, non-sample records are listed. Header "Explore" dropdown points here; `/treatments` stays as the A–Z alias and loses its hardcoded "Eight treatments in this release" copy.

**Catalog data — `src/lib/content.server.ts` / `content.functions.ts`**

Add `listCatalog()` returning entity-typed, parent-resolved rows plus media, and `getTreatmentMedia()`. The `isDemo` service-role fallback path is **removed** for public listings: public pages read only the RLS-enforced client. Detail pages for incomplete records still render (via the existing gated path) but stay `noindex` and are excluded from all listings, search, and the sitemap.

**Search — `src/lib/search-index.ts`**

Replace the hardcoded arrays with a loader-provided index built from the catalog, keeping the existing grouped-overlay UI. Group headings become the five entity types plus Comparisons and Local prices.

**Popular US/CA comparisons — `src/lib/content-types.ts`**

Extend `COMPARISON_DISPLAY_ORDER` with the high-intent pairs: botox-vs-dysport, botox-vs-xeomin, botox-vs-daxxify, juvederm-vs-restylane, voluma-vs-sculptra, sculptra-vs-radiesse, kybella-vs-coolsculpting, morpheus8-vs-ultherapy, thermage-vs-ultherapy, hydrafacial-vs-diamondglow. A `region` tag (`us` | `ca` | `both`) drives a "Popular in Canada" strip on `/compare` (Canadian availability differs — e.g. Daxxify). Pairs without complete records are listed only once their records qualify.

**Notices removal**

Delete the "Editorial review in progress" aside in `compare.$slug.tsx` and the demonstration/prototype language in `treatments.$slug.tsx` and `content.server.ts` comments. `EvidenceState`'s `unsourced` variant is removed from public rendering; the last-reviewed date remains as the only quality signal.

---

## Preserved safeguards

SSR loaders (no client fetching), RLS-enforced public reads, `treatment_sources` claim-level citations, `ComparisonDisclaimer` on every comparison and treatment page, `/medical-disclaimer` with `max-snippet:0`, absolute canonicals, and the sitemap's reviewed-only filter. Incomplete records: `noindex, follow`, absent from sitemap, search, Explore, and related-links.

---

## Delete or simplify

- `COMPARISON_ROWS` (25-row mega-table) and `QUICK_COMPARISON_ROWS` — superseded by templates.
- The unreviewed-branch JSX in `compare.$slug.tsx` (~60 lines) and its review-request form.
- The `isDemo` / service-role prototype read path in `content.server.ts` for listings.
- Hardcoded arrays in `search-index.ts` and the `FILTERS` constant in `treatments.index.tsx`.
- The `LABELS` map in `compare.index.tsx`, duplicating `content-types.ts`.
- Consultation-questions block, moved out of the comparison page.

---

## Phases

1. Migration: entity typing, `treatment_media`, `row_template`, backfill of the 10 existing rows.
2. Catalog server functions + Explore routes + search rewired to the database.
3. Comparison templates + glance card + expandable details; remove the long editorial flow.
4. Notice removal and noindex/link-suppression audit for incomplete records.
5. Popular US/CA pairs, imagery ingestion with rights metadata, sitemap and SEO verification, accessibility pass (`<details>` keyboard operation, table semantics, no color-only meaning).
