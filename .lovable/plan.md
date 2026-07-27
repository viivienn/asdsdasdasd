## Aesthetic Index — Release 1: Validation MVP

The approved relational architecture is the foundation and is not simplified. This release narrows *what gets built on top of it* to validate three behaviors: comparison-table comprehension, click-through from comparison into local pricing, and coverage requests by city/ZIP.

### Implementation order

Executed in this sequence, stopping at the end for a report.

---

### 1. Schema and RLS (Lovable Cloud, committed migrations)

Full relational model as approved — no shortcut tables, no mutable price field.

- **treatments** — identity seeded factually (name, slug, category, treatment_class, brand/generic) for Botox, Dysport, Sculptra, Radiesse, HA filler, Morpheus8, Thermage FLX, Ultherapy. All clinical/narrative columns exist but are seeded only with clearly labeled demonstration text at `publication_status='draft'`, `is_sample=true`, null `evidence_grade`, null `last_reviewed_at`.
- **treatment_sources** — per-claim sourcing.
- **comparisons** — editorial distinction fields; `CHECK (treatment_a_id < treatment_b_id)` plus a generated `pair_key` with a unique index so a pair cannot be duplicated in reverse.
- **locations** — unique on `(country_code, region_code, city_slug)`; San Francisco seeded, `is_indexable=false` until real data lands.
- **clinics** — unique on `(location_id, clinic_slug)`, with `is_sample`.
- **price_observations** — immutable observations (new row per change, never an update). Columns: is_sample, currency, advertised_amount, regular_amount, pricing_unit, quantity, effective_unit_price, treatment_area, starts_at_price, membership_required, new_customer_only, minimum_purchase, manufacturer_reward_required, conditions, source_url, source_type, observed_at, expires_at, verification_status, publication_status. Money is `numeric`.
- **offers** — created for schema completeness with validity window, restrictions, source, verification, approval, is_sample. Not surfaced in this release.
- **city_requests** and **price_alert_interest** — submission tables for the two forms.
- **user_roles** + `app_role` enum + `private.has_role(uuid, app_role)` security-definer with `set search_path = ''`, execute revoked from PUBLIC/anon.

`is_sample boolean not null default false` on treatments, comparisons, clinics, price_observations, offers — set per row, never inherited.

Every table: explicit GRANTs → enable RLS → policies. Public SELECT requires `publication_status='published' AND is_sample=false`, plus `is_indexable` for locations and an active window for offers. Submission tables are insert-only for the public with no read access; admin policies use `(select private.has_role(auth.uid(),'admin'))`.

Verification step before moving on: run the security scan and a vitest suite asserting anonymous cannot read drafts, cannot read sample rows, cannot read submissions, cannot mutate editorial data; and non-admin authenticated users cannot reach admin rows.

---

### 2. Design system

Warm ivory background, charcoal text, muted wine accent, pale blush and muted sage surfaces — oklch semantic tokens in `src/styles.css`. Instrument Serif display / Inter body, loaded via `<link>` in the root route. Thin rules, restrained borders, minimal shadows, generous spacing. No gradients, glassmorphism, illustrations, or scoring imagery.

---

### 3–8. Public routes

| Route | Build |
|---|---|
| `/` | Product explanation, tagline, treatment selector, entry into comparisons |
| `/compare` | Hub + two-treatment picker |
| `/compare/$slug` | One reusable route. Sculptra vs. Radiesse polished first, then the four remaining named pairs through the same template |
| `/treatments` | Index |
| `/treatments/$slug` | One reusable route |
| `/methodology`, `/about` | Real editorial copy, no generated medical claims |

Comparison table is a semantic `<table>` on desktop with row headers, collapsing to stacked attribute pairs on mobile. Sources, evidence state, and "demonstration content" state are explicit text-labeled UI states, never color-only. Server-rendered content via TanStack Start route loaders calling public server functions; content is in the initial HTML.

---

### 9. `/prices/us/ca/san-francisco/botox`

Reads through `locations` → `clinics` → `price_observations` → `treatments`. Renders only observations that are published, non-sample, have a source URL, and have an `observed_at`. Each row shows clinic, advertised amount, pricing unit, quantity, effective unit price, starts-at / new-client / membership / minimum-purchase flags, conditions, source link, and observation date, plus verification and freshness badges.

Since no real observations exist yet, the page ships in its noindex empty-coverage state with a clear explanation. No invented clinic prices, no averages or medians computed from anything. The template is built to accept the 10–15 manually sourced observations you add later.

Comparison pages get a prominent "See publicly listed prices near you" action linking into this flow.

---

### 10. Forms

**Coverage request** — modal opened from the comparison-page action: email, ZIP, optional city, treatment prefilled from the current page, consent checkbox. Writes to `city_requests`. Confirmation: "Thanks. We'll use your request to prioritize pricing coverage in your area." No fake-door language in copy.

**Price-alert interest** — on the SF Botox page: email, ZIP, treatment, optional max price per unit. Labeled "Price monitoring is in development. Join the early-access list." No claim of active monitoring.

Both submit through a server function with Zod validation, length caps, URL/email validation, a honeypot field, sanitization, and basic rate limiting — not direct anonymous table inserts. Submitted rows are never publicly readable.

---

### 11. Navigation

Compare · Treatments · SF Botox Prices · Methodology · About. No empty Prices, Offers, Clinics, or Planner entries.

---

### SEO

TanStack Start route `head()` only — no React Helmet. Indexable pages get a unique title, meta description, self-referencing canonical on `aestheticindex.co`, one visible H1, Open Graph tags, server-rendered table content, internal links, sources, and a last-verified date.

Sitemap contains only manually approved, non-sample, published pages — at the end of this pass: `/`, `/compare`, `/methodology`, `/about`. Every page carrying demonstration medical content is `noindex`, as is the SF Botox page until it holds enough real sourced pricing. Structured data: WebSite + Organization at root, BreadcrumbList on deep routes; nothing containing sample medical or pricing facts.

---

### Final checks and report

Security scan + RLS tests, mobile responsiveness pass, accessibility pass (keyboard operation, focus indicators, labeled inputs, table semantics, contrast, no color-only meaning), and SEO verification.

Then stop and report: routes created, tables and policies created, which pages contain sample content, which are indexable, which are noindex, forms created, security tests run, remaining manual data needed, and any technical problems or assumptions.

No automatic continuation into crawling, offers, clinic pages, additional cities, authentication, admin tooling, or monetization.

### Note

Connecting GitHub is a manual step on your side (Plus (+) menu → GitHub → Connect project) — worth doing before the migrations land so the schema history syncs from the start, but it won't block me.
