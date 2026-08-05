# Post-deployment SEO checklist

## Domain and responses

- [ ] `https://aestheticindex.app/` returns 200.
- [ ] HTTP, `www.aestheticindex.app`, and the legacy `.co` host permanently redirect to the matching `.app` URL.
- [ ] Non-root trailing slashes and duplicate slashes permanently normalize once without a chain.
- [ ] A nonexistent treatment, comparison, concern, class, and price combination returns a real 404.
- [ ] `/auth` and `/my-research` are noindex and excluded from the sitemap.

## Crawlers

- [ ] `/robots.txt` contains the production sitemap and the intended search/training split.
- [ ] CDN/WAF logs show Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, Claude-SearchBot, and Claude-User are not challenged on public pages.
- [ ] Private/API/MCP/account paths remain blocked.
- [ ] No public route receives a host-level `X-Robots-Tag: noindex`.

## Sitemap and rendered pages

- [ ] `/sitemap.xml` is valid XML and contains only `.app` canonical URLs.
- [ ] Every sitemap URL returns 200, one H1, one title, a description, a self-canonical, and no noindex.
- [ ] Treatment facts, comparison Bottom line/table, sources, concern/class profile links, and regional price facts appear in View Source before client interaction.
- [ ] Empty prices, arbitrary comparisons, report drafts, filter URLs, auth, and My Research are absent.
- [ ] `lastmod` values match stored substantive review/research dates.

## Structured data and accessibility

- [ ] Test representative pages with Schema.org Validator and Google Rich Results Test where supported.
- [ ] Structured data matches visible text and uses `.app` IDs.
- [ ] Keyboard-test header menus, search, treatment picker, accordions, auth modal, and price controls.
- [ ] Test mobile layouts at 320 px, 375 px, tablet, and desktop without horizontal overflow.
- [ ] Confirm treatment/media images reserve dimensions and have useful alt text or correctly empty decorative alt text.

## Performance and monitoring

- [ ] Run Lighthouse/PageSpeed on homepage, a comparison, a treatment, and a price page.
- [ ] Check LCP media loading, layout shifts, font loading, and long main-thread tasks.
- [ ] Submit the sitemap to Google and Bing.
- [ ] Inspect the first priority pages in Search Console after deployment.
- [ ] Monitor indexing and crawler errors weekly during launch; do not interpret temporary indexing lag as a guaranteed defect.

## Repository validation

With a local production server running, execute:

```powershell
node scripts/seo-route-audit.mjs http://127.0.0.1:4173
```

The script fails on sitemap 200/canonical/noindex/H1/title/description/JSON-LD or broken-internal-link regressions.
