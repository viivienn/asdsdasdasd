// Canonical public entity information for Aesthetic Index.
// Everything here is also stated in visible page copy (/about, /methodology,
// /medical-disclaimer) so structured data never claims more than the page shows.

export const SITE_URL = "https://aestheticindex.co";

export const SITE = {
  name: "Aesthetic Index",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.ico`,
  description:
    "Independent consumer platform for comparing cosmetic treatments and publicly listed local prices.",
  foundingPurpose:
    "To make cosmetic treatment differences and publicly advertised prices comparable without sponsorship.",
  editorialPolicy: `${SITE_URL}/about`,
  pricingMethodology: `${SITE_URL}/methodology`,
  medicalDisclaimer: `${SITE_URL}/medical-disclaimer`,
  correctionPolicy: `${SITE_URL}/about#corrections`,
  contactEmail: "corrections@aestheticindex.co",
} as const;

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: SITE.logo,
    description: SITE.description,
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