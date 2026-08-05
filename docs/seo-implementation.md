# Search and answer-engine implementation

## Canonical and crawler foundation

- The production origin now defaults to `https://aestheticindex.app` and can be overridden with `VITE_SITE_URL`/`SITE_URL` for a controlled environment.
- `pageMetadata()` centralizes titles, descriptions, robots directives, canonicals, Open Graph, and Twitter metadata.
- The server permanently normalizes the known legacy `.co` and `www` hosts, HTTP on the canonical host, duplicate slashes, and non-root trailing slashes.
- Private/account/API/MCP/preview paths receive an `X-Robots-Tag: noindex, nofollow` response header.
- `/robots.txt` is generated from the configured origin. Search and user-directed retrieval are allowed for Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, and Claude-User. GPTBot and ClaudeBot are blocked from model-training crawling. Private paths remain blocked in every search-crawler group.

Host-level WAF and CDN behavior cannot be proven from repository code. It must be checked after publishing.

## Indexable information architecture

The implementation adds:

- `/concerns` and four stable concern pages;
- `/treatment-classes` and six stable class pages;
- `/prices/:treatment/:region` for every published treatment-specific regional dataset;
- a crawler-visible price directory linking every complete regional page;
- `/contact` for corrections and contact;
- a noindex `/reports/aesthetic-treatment-price-index` architecture and gated CSV route.

Concern and class pages only enter the sitemap when their runtime catalog relationship has at least one published treatment and approved source data. Regional price pages exist only for RLS-approved stored estimates with a concrete treatment subject, a source count, and source URLs. Missing combinations return 404 and never enter the sitemap.

## Sitemap

`/sitemap.xml` now combines:

- canonical static public directories and policies;
- source-backed concern and class pages;
- reviewed/indexable comparisons;
- sourced treatment profiles with real review dates;
- published regional price pages with stored update/research dates;
- clinic-specific price pages only if their existing feature flag and indexability rules are enabled.

It excludes auth, My Research, APIs, report drafts, arbitrary comparisons, incomplete profiles, samples, empty pricing pages, and query/filter variants. Sitemap XML is escaped, deduplicated, and sorted.

## Page improvements

- The homepage H1 now says what the product does and prints profile/comparison counts from published loader data.
- The brand home link has an explicit accessible name.
- Corrections & contact points to a real route.
- Approved comparisons now expose an SSR-rendered Bottom line, Key differences, profile links, claim-aware Q&A, sources, and related concern/class directories without declaring a winner.
- Treatment pages now emit `MedicalWebPage` plus breadcrumb JSON-LD and link to related concerns, classes, comparisons, and published regional price pages.
- Regional price pages show the stored currency, basis, range, midpoint only when stored, source count, research date, methodology, exclusions, limitations, source URLs, treatment profile, comparisons, disclaimers, and price-update account control.
- Stable concern and class pages show only published profiles and their recorded sources; they explicitly avoid diagnosis and recommendations.

## Structured data

Visible data generates `Organization`, `WebSite`, `MedicalWebPage`, `BreadcrumbList`, and `Dataset` JSON-LD where appropriate. No Person, review, rating, physician, offer, availability, or fake editorial claims were added. Stable IDs use the production origin.

The annual report `Dataset` and CSV metadata remain disabled until `VITE_PRICE_INDEX_REPORT_PUBLISHED=true` is deliberately configured after editorial approval.

## Analytics and verification

Existing analytics is preserved. Answer-engine referrer classification already records coarse sources for ChatGPT, Perplexity, Copilot, Bing, Gemini, and Claude without email, postal code, or medical information.

Optional verification metadata is configured with:

- `VITE_GOOGLE_SITE_VERIFICATION`
- `VITE_BING_SITE_VERIFICATION`

Existing IndexNow support remains gated by server secrets `INDEXNOW_KEY` and `INDEXNOW_TOKEN` and accepts only canonical-host URLs.

## Automated safeguards

- `src/lib/seo.test.ts` validates production canonicals, route-policy separation, unique taxonomy slugs, JSON-LD serialization, crawler directives, the data-derived homepage count, image alt attributes, and database-gated sitemap construction.
- `scripts/seo-route-audit.mjs` reads the running sitemap and checks each URL for HTTP 200, one title, a description, self-canonical, indexability, one H1, valid JSON-LD, and non-broken internal links.
- `AGENTS.md` now permanently prohibits fabricated facts, incomplete indexable pages, keyword-variation pages, fake credentials, noncanonical domains, and build-time `lastmod` churn.

## Deliberately not implemented

- No medical, regulatory, treatment, source, media-rights, or pricing records were changed.
- No author, editor, medical reviewer, or clinical credential was invented.
- No FAQ rich-result strategy or unsupported FAQ schema was added.
- No WAF, DNS, Google, Bing, analytics-account, or Lovable production setting was changed from code.
- The draft annual report is not indexable and its CSV returns 404 until explicitly published.
- Search ranking, indexing, AI citation, and traffic are not guaranteed.
