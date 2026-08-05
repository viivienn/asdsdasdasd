# SEO baseline

Baseline inspected on 2026-08-04 at commit `a3d679c` before this implementation.

## Application architecture

| Area           | Baseline                                                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework      | TanStack Start with React 19 and file-based TanStack Router routes                                                                                                                                   |
| Build          | Vite 8 through `@lovable.dev/vite-tanstack-config`; Nitro/Cloudflare module production output                                                                                                        |
| Hosting        | Lovable-connected GitHub repository; production domain named in the brief is `aestheticindex.app`                                                                                                    |
| Rendering      | TanStack Start SSR for public routes. Route loaders call server functions; treatment, comparison, and pricing facts are present in server HTML rather than revealed only after a search interaction. |
| Data           | Supabase/Postgres. Public reads use the publishable key behind RLS. Published/non-sample policy gates treatment, comparison, source, media, and regional-price records.                              |
| Metadata       | Route-local `head()` definitions plus root defaults                                                                                                                                                  |
| Build commands | `vite build`, `tsc --noEmit`, Node test runner, ESLint, Prettier                                                                                                                                     |

## Public route inventory before implementation

Public editorial/catalog routes were `/`, `/explore`, `/compare`, `/compare/:slug`, `/treatments`, `/treatments/:slug`, `/prices`, `/prices/us/ca/:city/:treatment`, `/methodology`, `/about`, `/medical-disclaimer`, and `/advertising-disclosure`.

Infrastructure and private routes included `/sitemap.xml`, `/indexnow-key.txt`, `/api/public/indexnow`, `/auth`, `/my-research`, OAuth/MCP routes, and generated 404/error surfaces.

There were no stable concern pages, treatment-class landing pages, canonical regional-estimate pages, contact route, or report architecture.

## Crawl and indexing baseline

- A static `public/robots.txt` allowed ordinary crawlers, OAI-SearchBot, and PerplexityBot; it blocked GPTBot. It did not explicitly address ChatGPT-User, Claude-SearchBot, Claude-User, or ClaudeBot.
- The sitemap dynamically included reviewed comparisons and sourced treatment profiles. Clinic-specific pricing pages were behind a disabled feature flag. Stored regional estimates were discoverable only after submitting a postal code and had no crawlable landing URLs.
- Authentication and My Research were `noindex` and excluded from the sitemap.
- Comparison and treatment routes returned a true TanStack `notFound()` for missing entities. Reverse comparison slugs permanently redirected to the canonical pair.
- Explore filters used query parameters but declared the unfiltered Explore canonical.
- No application-level alternate-host, legacy-domain, HTTP, or trailing-slash normalization existed.

## Metadata and structured-data baseline

- Core pages had unique route titles, descriptions, and canonicals, but the canonical origin was hard-coded as `https://aestheticindex.co`, conflicting with the production `.app` origin named in the brief.
- Root `Organization` and `WebSite` JSON-LD existed. Approved comparisons emitted `Article`/`MedicalWebPage` and breadcrumbs. The inactive clinic-pricing route could emit `Dataset` markup.
- Treatment profiles did not emit page-level JSON-LD.
- Google and Bing verification tokens had no environment-configured metadata hook.

## Content, navigation, and accessibility baseline

- Homepage H1 was “Understand treatments before you book,” which did not explicitly mention comparison factors or pricing.
- The treatment directory displayed a hard-coded “Eight treatments” statement rather than the published row count.
- “Corrections & contact” was a mail link rather than a stable page.
- The visible brand icon was already hidden from assistive technology, but the home link did not have an explicit accessible name.
- Search, selectors, comparison tables, breadcrumbs, save/auth controls, and mobile navigation already had a strong semantic base.
- Comparison facts and detailed source rows were SSR-rendered, including content inside native `details` elements.

## Baseline risks addressed in this change

1. Wrong canonical production origin.
2. Incomplete search/answer-engine crawler policy.
3. No crawlable regional estimate pages despite a verified stored dataset.
4. No stable concern or class landing pages.
5. No central metadata/canonical helper or route policy registry.
6. No automated live sitemap/canonical/H1/JSON-LD/link audit.
7. No report architecture or downloadable-dataset path.
8. Hard-coded public catalog count and weak homepage product description.

The baseline did not reveal a need to redesign the visual identity or alter medical and pricing records.
