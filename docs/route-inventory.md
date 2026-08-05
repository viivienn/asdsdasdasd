# Route inventory

## Indexable static directories and disclosures

| Route                     | State               | Notes                                                                                     |
| ------------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `/`                       | Indexable           | Homepage and discovery search                                                             |
| `/explore`                | Indexable canonical | Query filters canonicalize to the directory; filter combinations are not added to sitemap |
| `/compare`                | Indexable           | Comparison directory and picker                                                           |
| `/treatments`             | Indexable           | Published profile directory                                                               |
| `/concerns`               | Indexable           | Stable concern directory                                                                  |
| `/treatment-classes`      | Indexable           | Stable class directory                                                                    |
| `/prices`                 | Indexable           | Postal lookup plus crawlable published market directory                                   |
| `/methodology`            | Indexable           | Content and pricing methodology                                                           |
| `/about`                  | Indexable           | Mission, independence, and correction policy                                              |
| `/contact`                | Indexable           | Correction and contact instructions                                                       |
| `/medical-disclaimer`     | Indexable           | Disclosure; deliberately not a primary acquisition page                                   |
| `/advertising-disclosure` | Indexable           | Commercial separation policy                                                              |

## Database-gated indexable routes

| Pattern                          | State rule                                                                                                                            |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/treatments/:slug`              | Published/non-sample treatment, real review date, and source records                                                                  |
| `/compare/:slug`                 | Both profiles pass the comparison completeness gate; comparison is published, non-sample, explicitly indexable, reviewed, and sourced |
| `/concerns/:slug`                | Known stable concern plus at least one related published profile and source record                                                    |
| `/treatment-classes/:slug`       | Known stable class plus at least one related published profile and source record                                                      |
| `/prices/:treatment/:region`     | Published/non-sample treatment-specific regional estimate with source count and URLs                                                  |
| `/prices/us/ca/:city/:treatment` | Only when the existing clinic directory flag is enabled and real indexable observations exist                                         |

## Noindex or excluded routes

| Route/pattern                                                   | Behavior                                                                              |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `/auth`                                                         | `noindex, nofollow`, blocked in robots, excluded from sitemap                         |
| `/my-research`                                                  | Auth-required, `noindex, nofollow`, blocked in robots, excluded from sitemap          |
| `/reports/aesthetic-treatment-price-index`                      | Noindex until the report publication feature is explicitly enabled with verified data |
| `/reports/aesthetic-treatment-price-index.csv`                  | 404 until report publication; always `X-Robots-Tag: noindex` when downloadable        |
| `/api/*`, `/admin/*`, `/internal/*`, `/preview/*`, `/staging/*` | Blocked and server-header noindex where routed                                        |
| OAuth and MCP routes                                            | Infrastructure; blocked/excluded, not public editorial landing pages                  |
| Search/filter query URLs                                        | Not in sitemap; canonicalize to the main directory                                    |
| Arbitrary/incomplete comparison URLs                            | Noindex or 404 depending on validity; never in sitemap                                |
| Empty/incomplete price combinations                             | 404; never in sitemap                                                                 |

## Redirects

- Reversed direct comparison pairs redirect 301 to the stored canonical pair.
- Concern aliases `volume-contour`, `lift-tighten`, and `texture-pores` redirect 301 to their stable concern slugs.
- Known legacy/`www` hosts, HTTP canonical-host requests, duplicate slashes, and non-root trailing slashes redirect 308 to the preferred `.app` URL.

The sitemap is the machine-readable source of truth for the currently approved dynamic URLs.
