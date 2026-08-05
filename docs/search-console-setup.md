# Search Console, Bing, and referral measurement setup

## Google Search Console

1. Publish the current build on `https://aestheticindex.app` and confirm the custom domain is the primary Lovable domain.
2. Add a **Domain property** for `aestheticindex.app` in Google Search Console.
3. Add the DNS TXT verification record at the DNS provider. Do not place the private DNS value in Git.
4. Optionally set `VITE_GOOGLE_SITE_VERIFICATION` to Google's HTML verification token and redeploy. DNS verification is still preferred for full-domain coverage.
5. Submit `https://aestheticindex.app/sitemap.xml`.
6. Inspect and request indexing for the homepage, one treatment, one comparison, one concern, one class page, and one regional price page.
7. In URL Inspection, confirm the rendered HTML contains the H1, facts/table, citations, internal links, canonical, and `index, follow` directive.
8. Monitor Page indexing, Crawl stats, Core Web Vitals, HTTPS, Manual actions, and Security issues.

## Bing Webmaster Tools

1. Import the verified Search Console property or add `aestheticindex.app` directly.
2. Add Bing's DNS token or set `VITE_BING_SITE_VERIFICATION` to the supplied `msvalidate.01` value and redeploy.
3. Submit the same sitemap.
4. Configure `INDEXNOW_KEY` and `INDEXNOW_TOKEN` only in Lovable server secrets if IndexNow will be used.
5. After a materially changed public URL is deployed, POST canonical URLs to `/api/public/indexnow` with the shared token in `x-indexnow-token`. Do not submit private, noindex, query/filter, or incomplete URLs.

## Analytics report for search and answer engines

The application emits `answer_engine_referral` with only `source`, `landing_path`, and optional `utm_source`.

Use the acquisition platform's session source/medium report alongside that event so conventional search is not mixed with answer-engine referrals:

- `google / organic` for Google Search, including traffic from Google AI features when Google attributes it to organic search;
- `bing / organic` for Bing and qualifying Copilot search referrals;
- referral host or the coarse `answer_engine_referral.source` value for ChatGPT, Claude, Gemini, Perplexity, and other identifiable answer systems;
- Search Console landing-page and query reports as the authoritative companion report for Google impressions and clicks.

Create channel segments rather than trying to infer private prompts or medical intent. Referrer and campaign attribution can be absent or rewritten by apps, so report unidentified traffic as unknown instead of guessing its source.

Create an analytics exploration/report with:

- event name: `answer_engine_referral`;
- dimension: `source`;
- secondary dimension: `landing_path`;
- metrics: users, sessions, engaged sessions, and downstream public conversion events.

For links you control, use `utm_source=chatgpt.com`. Build a separate segment where either:

- event source is `chatgpt`; or
- session campaign source equals `chatgpt.com`.

Referrer reporting is incomplete by nature: some apps and answer systems remove or change referrer data. Do not infer medical intent or store queries containing personal health information.
