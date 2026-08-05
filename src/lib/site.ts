// Canonical public entity information for Aesthetic Index.
// Everything here is also stated in visible page copy (/about, /methodology,
// /medical-disclaimer) so structured data never claims more than the page shows.

const viteEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env;

const configuredSiteUrl =
  viteEnv?.VITE_SITE_URL?.trim() ||
  (typeof process !== "undefined" ? process.env.SITE_URL?.trim() : undefined) ||
  "https://aestheticindex.app";

export const SITE_URL = configuredSiteUrl.replace(/\/+$/, "");

export const SITE = {
  name: "Aesthetic Index",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  descriptiveName: "Aesthetic Index — Cosmetic Treatment Comparisons and Prices",
  description:
    "Source-backed cosmetic treatment profiles, comparisons, risks, downtime, and researched regional price estimates.",
  foundingPurpose:
    "To make cosmetic treatment differences and typical regional pricing easier to compare.",
  editorialPolicy: `${SITE_URL}/about`,
  pricingMethodology: `${SITE_URL}/methodology`,
  medicalDisclaimer: `${SITE_URL}/medical-disclaimer`,
  correctionPolicy: `${SITE_URL}/about#corrections`,
  // Keep the established mailbox until the owner confirms mail delivery on the .app domain.
  contactEmail: "corrections@aestheticindex.co",
} as const;

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath.replace(/\/+$/, "")}`;
}

export type PageMetadataOptions = {
  title: string;
  description: string;
  path: string;
  indexable?: boolean;
  type?: "website" | "article";
  image?: string | null;
};

/** One route-aware source of canonical, social, and robots metadata. */
export function pageMetadata({
  title,
  description,
  path,
  indexable = true,
  type = "website",
  image,
}: PageMetadataOptions) {
  const canonical = absoluteUrl(path);
  const trimmedDescription = description.trim().slice(0, 160);
  const meta = [
    { title },
    { name: "description", content: trimmedDescription },
    {
      name: "robots",
      content: indexable
        ? "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        : "noindex, follow",
    },
    { property: "og:site_name", content: SITE.name },
    { property: "og:title", content: title },
    { property: "og:description", content: trimmedDescription },
    { property: "og:url", content: canonical },
    { property: "og:type", content: type },
    { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: trimmedDescription },
  ];
  if (image) {
    const imageUrl = image.startsWith("http") ? image : absoluteUrl(image);
    meta.push({ property: "og:image", content: imageUrl });
    meta.push({ name: "twitter:image", content: imageUrl });
  }
  return {
    meta,
    links: [{ rel: "canonical", href: canonical }],
  };
}

export function verificationMeta() {
  const google = viteEnv?.VITE_GOOGLE_SITE_VERIFICATION?.trim();
  const bing = viteEnv?.VITE_BING_SITE_VERIFICATION?.trim();
  return [
    ...(google ? [{ name: "google-site-verification", content: google }] : []),
    ...(bing ? [{ name: "msvalidate.01", content: bing }] : []),
  ];
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: SITE.logo,
    description: SITE.description,
    alternateName: SITE.descriptiveName,
    email: SITE.contactEmail,
    publishingPrinciples: SITE.editorialPolicy,
    correctionsPolicy: SITE.correctionPolicy,
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
