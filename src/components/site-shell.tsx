import { Link } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FOOTER_DISCLAIMER } from "@/components/disclaimers";
import { SiteSearch } from "@/components/site-search";
import { trackAnswerEngineReferral } from "@/lib/analytics";
import { GOAL_FILTERS, slugifyType } from "@/lib/taxonomy";
import type { PopularComparison, TreatmentPickerRecord } from "@/lib/content-types";
import type { SearchIndex } from "@/lib/search-index";

type NavLink = {
  to: string;
  params?: Record<string, string>;
  label: string;
  detail: string;
};

const TOOLS: NavLink[] = [
  { to: "/compare", label: "Compare any two", detail: "Build a comparison yourself" },
  { to: "/methodology", label: "Methodology", detail: "How we source and check" },
  { to: "/medical-disclaimer", label: "Medical disclaimer", detail: "What this site is not" },
];

const MOBILE_NAV: NavLink[] = [
  { to: "/explore", label: "Explore", detail: "" },
  { to: "/compare", label: "Compare", detail: "" },
  { to: "/treatments", label: "Treatments", detail: "" },
  { to: "/methodology", label: "Methodology", detail: "" },
  { to: "/about", label: "About", detail: "" },
];

function MenuColumn({
  title,
  accent,
  children,
}: {
  title: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p
        className={`inline-block rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-[0.08em] ${accent}`}
      >
        {title}
      </p>
      <ul className="mt-2 space-y-1">{children}</ul>
    </div>
  );
}

function MenuItem({
  to,
  params,
  search,
  label,
  onNavigate,
}: {
  to: string;
  params?: Record<string, string>;
  search?: Record<string, string>;
  label: string;
  onNavigate: () => void;
}) {
  return (
    <li>
      <Link
        to={to}
        params={params}
        search={search}
        onClick={onNavigate}
        className="block truncate rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        {label}
      </Link>
    </li>
  );
}

function ExploreMenu({ treatments }: { treatments: TreatmentPickerRecord[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const byType = (type: string) =>
    treatments
      .filter((entry) => entry.entity_type === type)
      .sort((a, b) => a.sort_rank - b.sort_rank || a.name.localeCompare(b.name))
      .slice(0, 8);

  const products = byType("product");
  const devices = byType("device");
  const procedures = byType("procedure");
  const classes = byType("class");
  const types = [...new Set(treatments.map((entry) => entry.category).filter(Boolean))]
    .sort()
    .slice(0, 8);

  return (
    <li
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        Explore
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="absolute left-1/2 top-full z-50 w-[min(64rem,92vw)] -translate-x-1/2 pt-2">
          <div className="rounded-2xl border border-rule bg-popover p-5 shadow-lift">
            <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
              <MenuColumn title="Products" accent="bg-secondary text-secondary-foreground">
                {products.map((entry) => (
                  <MenuItem
                    key={entry.id}
                    to="/treatments/$slug"
                    params={{ slug: entry.slug }}
                    label={entry.name}
                    onNavigate={close}
                  />
                ))}
              </MenuColumn>
              <MenuColumn title="Treatment goals" accent="bg-sage text-sage-foreground">
                {GOAL_FILTERS.map((goal) => (
                  <MenuItem
                    key={goal.slug}
                    to="/explore"
                    search={{ goal: goal.slug }}
                    label={goal.label}
                    onNavigate={close}
                  />
                ))}
              </MenuColumn>
              <MenuColumn title="Treatment types" accent="bg-rose text-rose-foreground">
                {types.map((type) => (
                  <MenuItem
                    key={type}
                    to="/explore"
                    search={{ type: slugifyType(type) }}
                    label={type}
                    onNavigate={close}
                  />
                ))}
              </MenuColumn>
              <MenuColumn title="Devices" accent="bg-muted text-muted-foreground">
                {devices.map((entry) => (
                  <MenuItem
                    key={entry.id}
                    to="/treatments/$slug"
                    params={{ slug: entry.slug }}
                    label={entry.name}
                    onNavigate={close}
                  />
                ))}
                {procedures.length ? (
                  <li className="pt-2">
                    <p className="px-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Procedures
                    </p>
                  </li>
                ) : null}
                {procedures.map((entry) => (
                  <MenuItem
                    key={entry.id}
                    to="/treatments/$slug"
                    params={{ slug: entry.slug }}
                    label={entry.name}
                    onNavigate={close}
                  />
                ))}
              </MenuColumn>
              <MenuColumn title="Treatment classes" accent="bg-accent text-accent-foreground">
                {classes.map((entry) => (
                  <MenuItem
                    key={entry.id}
                    to="/treatments/$slug"
                    params={{ slug: entry.slug }}
                    label={entry.name}
                    onNavigate={close}
                  />
                ))}
              </MenuColumn>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 border-t border-rule pt-4 text-sm">
              <Link to="/explore" onClick={close} className="font-medium hover:text-primary">
                Explore everything
              </Link>
              <Link to="/treatments" onClick={close} className="hover:text-primary">
                All treatment profiles
              </Link>
              <Link to="/compare" onClick={close} className="hover:text-primary">
                Popular comparisons
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function ToolsMenu() {
  const [open, setOpen] = useState(false);
  return (
    <li
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-full px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        Tools
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 w-60 pt-2">
          <ul className="rounded-xl border border-rule bg-popover p-1 shadow-lift">
            {TOOLS.map((item) => (
              <li key={item.label}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-2.5 py-2 transition-colors hover:bg-secondary"
                >
                  <span className="block text-sm font-medium text-foreground">{item.label}</span>
                  <span className="block text-xs text-muted-foreground">{item.detail}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

export function SiteShell({
  children,
  searchIndex,
  popularComparisons,
  treatments,
}: {
  children: ReactNode;
  searchIndex: SearchIndex;
  popularComparisons: PopularComparison[];
  treatments: TreatmentPickerRecord[];
}) {
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
            <SiteSearch index={searchIndex} />
          </div>
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center gap-0.5">
              <ExploreMenu treatments={treatments} />
              <li>
                <Link
                  to="/compare"
                  className="rounded-full px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  activeProps={{ className: "bg-secondary text-secondary-foreground font-medium" }}
                >
                  Compare
                </Link>
              </li>
              <li>
                <Link
                  to="/prices/us/ca/$city/$treatment"
                  params={{ city: "san-francisco", treatment: "botox" }}
                  className="rounded-full px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  Local prices
                </Link>
              </li>
              <ToolsMenu />
              <li>
                <Link
                  to="/about"
                  className="rounded-full px-2.5 py-1 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
          <SiteSearch index={searchIndex} />
        </div>
        <nav aria-label="Primary mobile" className="lg:hidden">
          <ul className="flex gap-1 overflow-x-auto px-4 pb-3 text-sm">
            {MOBILE_NAV.map((item) => (
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
          {popularComparisons.length ? (
            <nav aria-label="Popular comparisons" className="mt-6">
              <h2 className="text-xs uppercase tracking-wider">Popular comparisons</h2>
              <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
                {popularComparisons.map((comparison) => (
                  <li key={comparison.slug}>
                    <Link
                      to="/compare/$slug"
                      params={{ slug: comparison.slug }}
                      className="hover:text-foreground hover:underline"
                    >
                      {comparison.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1">
            <li>
              <Link
                to="/medical-disclaimer"
                className="underline underline-offset-4 hover:text-foreground"
              >
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
