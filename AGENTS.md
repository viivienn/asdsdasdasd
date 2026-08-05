<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Permanent public-content and SEO rules

- Never fabricate medical, regulatory, outcome, pricing, geographic, source, review, or publication facts.
- Every factual medical claim rendered publicly must come from approved source data.
- Never create an indexable page solely to target keyword variations or filter combinations.
- Never publish an incomplete comparison or regional-price page.
- Every indexable route needs a unique title, useful description, self-referencing production canonical, one clear H1, and a real HTTP 200 response.
- Public information pages must remain crawlable and server-rendered; authentication is only for persistent personal features.
- Keep drafts, samples, private/account pages, previews, APIs, search results, and empty price pages out of the sitemap.
- Do not add fake editorial ownership, author identities, medical reviewers, clinical credentials, ratings, or review counts.
- Use the production origin from `src/lib/site.ts`; do not hard-code alternate canonical domains.
- `lastmod` must reflect substantive stored content changes, not a build or deployment time.
