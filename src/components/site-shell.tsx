import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FOOTER_DISCLAIMER } from "@/components/disclaimers";
import { SiteSearch } from "@/components/site-search";
import { trackAnswerEngineReferral } from "@/lib/analytics";
import { POPULAR_COMPARISON_SLUGS, comparisonLabel } from "@/lib/content-types";

type NavLink = {
  to: string;
  params?: Record<string, string>;
  label: string;
  detail: string;
};

const EXPLORE: NavLink[] = [
  { to: "/treatments", label: "Treatments", detail: "Every profile, same questions" },
  { to: "/compare", label: "Comparisons", detail: "Popular side-by-side pages" },
  {
    to: "/prices/us/ca/$city/$treatment",
    params: { city: "san-francisco", treatment: "botox" },
    label: "Local prices",
    detail: "Publicly listed clinic prices",
  },
];

const TOOLS: NavLink[] = [
  { to: "/compare", label: "Compare any two", detail: "Build a comparison yourself" },
  { to: "/methodology", label: "Methodology", detail: "How we source and check" },
  { to: "/medical-disclaimer", label: "Medical disclaimer", detail: "What this site is not" },
];

const FLAT_NAV: NavLink[] = [...EXPLORE, { to: "/about", label: "About", detail: "" }];

function NavMenu({ label, items, align = "left" }: { label: string; items: NavLink[]; align?: "left" | "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <li ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {label}
        <ChevronDown aria-hidden="true" className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          className={`absolute top-[calc(100%+0.5rem)] z-50 w-60 rounded-xl border border-rule bg-popover p-1 shadow-lift ${align === "right" ? "right-0" : "left-0"}`}
        >
          <ul className="space-y-0.5">
            {items.map((item, index) => (
              <li key={`${item.to}-${item.label}`}>
                <Link
                  to={item.to}
                  params={item.params}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2.5 py-2 transition-colors hover:bg-secondary"
                >
                  <span className="block text-sm font-medium text-foreground">{item.label}</span>
                  {item.detail ? (
                    <span className="block text-xs text-muted-foreground">{item.detail}</span>
                  ) : null}
                </Link>
                {index < items.length - 1 ? (
                  <div className="mx-2.5 my-1 border-b border-rule" />
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

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
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-1 text-sm">
              <NavMenu label="Explore" items={EXPLORE} />
              <NavMenu label="Tools" items={TOOLS} />
              <li>
                <Link
                  to="/about"
                  className="rounded-full px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}
                >
                  About
                </Link>
              </li>
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
        <nav aria-label="Primary mobile" className="lg:hidden">
          <ul className="flex gap-1 overflow-x-auto px-4 pb-3 text-sm">
            {[...FLAT_NAV, ...TOOLS.slice(1)].map((item) => (
              <li key={`${item.to}-${item.label}`} className="shrink-0">
                <Link
                  to={item.to}
                  params={item.params}
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