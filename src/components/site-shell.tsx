import { Link } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { FOOTER_DISCLAIMER } from "@/components/disclaimers";
import { ScrollCapture } from "@/components/scroll-capture";
import { SiteSearch } from "@/components/site-search";
import { trackAnswerEngineReferral } from "@/lib/analytics";
import { POPULAR_COMPARISON_SLUGS, comparisonLabel } from "@/lib/content-types";

const NAV = [
  { to: "/compare", label: "Compare" },
  { to: "/treatments", label: "Treatments" },
  {
    to: "/prices/us/ca/$city/$treatment",
    params: { city: "san-francisco", treatment: "botox" },
    label: "SF Botox Prices",
  },
  { to: "/methodology", label: "Methodology" },
  { to: "/about", label: "About" },
] as const;

export function SiteShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    trackAnswerEngineReferral();
  }, []);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 rule-top border-b border-rule bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5">
          <Link to="/" className="flex items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-8 place-items-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground"
            >
              AI
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Aesthetic Index
            </span>
          </Link>
          <div className="hidden min-w-0 flex-1 justify-center lg:flex">
            <SiteSearch />
          </div>
          <nav aria-label="Primary" className="hidden xl:block">
            <ul className="flex items-center gap-1 text-sm">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    params={"params" in item ? item.params : undefined}
                    className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Link
            to="/compare"
            className="hidden shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex"
          >
            Compare treatments
          </Link>
        </div>
        <div className="px-4 pb-3 lg:hidden">
          <SiteSearch />
        </div>
        <nav aria-label="Primary mobile" className="xl:hidden">
          <ul className="flex gap-1 overflow-x-auto px-4 pb-3 text-sm">
            {NAV.map((item) => (
              <li key={item.to} className="shrink-0">
                <Link
                  to={item.to}
                  params={"params" in item ? item.params : undefined}
                  className="rounded-full border border-rule px-3 py-1.5 text-muted-foreground"
                  activeProps={{ className: "bg-secondary text-secondary-foreground" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="main" className="mx-auto max-w-6xl px-5 py-10 sm:py-14">
        {children}
      </main>

      <ScrollCapture />

      <footer className="mt-16 rule-top border-t border-rule bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted-foreground">
          <p className="max-w-3xl">{FOOTER_DISCLAIMER}</p>
          <nav aria-label="Popular comparisons" className="mt-6">
            <h2 className="text-xs uppercase tracking-wider">Popular comparisons</h2>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
              {POPULAR_COMPARISON_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link
                    to="/compare/$slug"
                    params={{ slug }}
                    className="hover:text-foreground hover:underline"
                  >
                    {comparisonLabel(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link to="/medical-disclaimer" className="underline underline-offset-4 hover:text-foreground">
                Medical Disclaimer
              </Link>
            </li>
            <li>
              <Link to="/methodology" className="hover:text-foreground">
                Methodology
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-foreground">
                About
              </Link>
            </li>
            <li>
              <a href="mailto:corrections@aestheticindex.co" className="hover:text-foreground">
                Corrections &amp; contact
              </a>
            </li>
          </ul>
          <p className="mt-6 text-xs">© {new Date().getFullYear()} Aesthetic Index</p>
        </div>
      </footer>
    </div>
  );
}