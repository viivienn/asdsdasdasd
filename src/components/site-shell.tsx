import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FOOTER_DISCLAIMER } from "@/components/disclaimers";
import { SiteSearch } from "@/components/site-search";
import { trackAnswerEngineReferral } from "@/lib/analytics";
import type { EntityType, PopularComparison } from "@/lib/content-types";
import type { SearchEntry, SearchIndex } from "@/lib/search-index";
import { GOAL_FILTERS } from "@/lib/taxonomy";

function CatalogLink({ entry, onNavigate }: { entry: SearchEntry; onNavigate?: () => void }) {
  return (
    <Link
      to="/treatments/$slug"
      params={{ slug: entry.slug }}
      onClick={onNavigate}
      className="block rounded-md px-2 py-1.5 text-sm leading-tight transition-colors hover:bg-secondary hover:text-foreground"
    >
      {entry.label}
    </Link>
  );
}

function EntityLink({
  entity,
  label,
  detail,
  onNavigate,
}: {
  entity: EntityType;
  label: string;
  detail: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      to="/explore"
      search={{ entity }}
      onClick={onNavigate}
      className="block rounded-lg border border-rule bg-card px-3 py-2.5 transition-colors hover:border-primary"
    >
      <span className="block text-sm font-medium">{label}</span>
      <span className="mt-0.5 block text-xs text-muted-foreground">{detail}</span>
    </Link>
  );
}

function ExploreMenu({ index }: { index: SearchIndex }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function openMenu() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }

  function closeMenu() {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  return (
    <li ref={ref} className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
        onFocus={openMenu}
        className="flex items-center gap-1 rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary"
      >
        Explore
        <ChevronDown
          aria-hidden="true"
          className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Explore Aesthetic Index"
          className="absolute right-0 top-[calc(100%+0.6rem)] z-50 w-[min(62rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-rule bg-popover shadow-lift"
        >
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr_1fr_1.1fr]">
            <section className="border-b border-rule p-5 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Products
              </p>
              <div className="mt-2 space-y-0.5">
                {index.browse.product.slice(0, 6).map((entry) => (
                  <CatalogLink key={entry.slug} entry={entry} onNavigate={() => setOpen(false)} />
                ))}
                {index.browse.product.length === 0 ? (
                  <p className="px-2 py-2 text-sm text-muted-foreground">
                    Product profiles are being added.
                  </p>
                ) : null}
              </div>
              <Link
                to="/explore"
                search={{ entity: "product" }}
                onClick={() => setOpen(false)}
                className="mt-3 inline-flex items-center gap-1 px-2 text-sm font-medium text-primary"
              >
                Explore all products <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Brands
              </p>
              <div className="mt-2 space-y-0.5">
                {index.browse.brand_family.slice(0, 4).map((entry) => (
                  <CatalogLink key={entry.slug} entry={entry} onNavigate={() => setOpen(false)} />
                ))}
              </div>
            </section>

            <section className="border-b border-rule p-5 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Treatment goals
              </p>
              <ul className="mt-2 space-y-1">
                {GOAL_FILTERS.map((goal) => (
                  <li key={goal.slug}>
                    <Link
                      to="/explore"
                      search={{ goal: goal.slug }}
                      onClick={() => setOpen(false)}
                      className="block rounded-lg px-2 py-2 transition-colors hover:bg-secondary"
                    >
                      <span className="block text-sm font-medium">{goal.label}</span>
                      <span className="block text-xs text-muted-foreground">{goal.detail}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="border-b border-rule p-5 lg:border-b-0 lg:border-r">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Treatment types
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-1 lg:grid-cols-1">
                {index.categories.slice(0, 9).map((entry) => (
                  <li key={entry.slug}>
                    <Link
                      to="/explore"
                      search={{ type: entry.slug }}
                      onClick={() => setOpen(false)}
                      className="block rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-secondary"
                    >
                      {entry.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            <section className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Browse the index
              </p>
              <div className="mt-3 space-y-2">
                <EntityLink
                  entity="device"
                  label="Devices"
                  detail="Named energy and treatment platforms"
                  onNavigate={() => setOpen(false)}
                />
                <EntityLink
                  entity="procedure"
                  label="Procedures"
                  detail="Techniques performed in clinic"
                  onNavigate={() => setOpen(false)}
                />
                <EntityLink
                  entity="class"
                  label="Treatment classes"
                  detail="Understand the major approaches"
                  onNavigate={() => setOpen(false)}
                />
              </div>
            </section>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-rule bg-muted/40 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Explore products, technologies, and treatment approaches in one structured index.
            </p>
            <Link
              to="/explore"
              search={{}}
              onClick={() => setOpen(false)}
              className="shrink-0 text-sm font-medium underline underline-offset-4"
            >
              Explore everything
            </Link>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function MobileMenu({ index }: { index: SearchIndex }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="grid size-10 place-items-center rounded-full border border-rule lg:hidden"
      >
        <Menu className="size-5" aria-hidden="true" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] overflow-y-auto bg-background px-5 pb-10 pt-4 lg:hidden">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="font-display text-lg font-semibold"
            >
              Aesthetic Index
            </Link>
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setOpen(false)}
              className="grid size-11 place-items-center rounded-full border border-rule"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Mobile navigation" className="mt-8">
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/explore"
                search={{}}
                onClick={() => setOpen(false)}
                className="rounded-xl bg-secondary px-4 py-3 font-medium"
              >
                Explore
              </Link>
              <Link
                to="/compare"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-secondary px-4 py-3 font-medium"
              >
                Compare
              </Link>
              <Link
                to="/prices"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-secondary px-4 py-3 font-medium"
              >
                Local prices
              </Link>
              <Link
                to="/about"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-secondary px-4 py-3 font-medium"
              >
                About
              </Link>
            </div>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Treatment goals
            </p>
            <ul className="mt-2 divide-y divide-rule">
              {GOAL_FILTERS.map((goal) => (
                <li key={goal.slug}>
                  <Link
                    to="/explore"
                    search={{ goal: goal.slug }}
                    onClick={() => setOpen(false)}
                    className="block py-3 text-sm"
                  >
                    {goal.label}
                  </Link>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Browse
            </p>
            <div className="mt-3 grid gap-2">
              {(
                [
                  ["product", "Products"],
                  ["brand_family", "Brands"],
                  ["device", "Devices"],
                  ["procedure", "Procedures"],
                  ["class", "Treatment classes"],
                ] as const
              ).map(([entity, label]) => (
                <Link
                  key={entity}
                  to="/explore"
                  search={{ entity }}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-between rounded-xl border border-rule bg-card px-4 py-3 text-sm"
                >
                  {label}
                  <span className="text-xs text-muted-foreground">
                    {index.browse[entity].length}
                  </span>
                </Link>
              ))}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}

export function SiteShell({
  children,
  searchIndex,
  popularComparisons,
}: {
  children: ReactNode;
  searchIndex: SearchIndex;
  popularComparisons: PopularComparison[];
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
      <header className="sticky top-0 z-40 border-b border-rule bg-background/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="grid size-9 place-items-center rounded-xl bg-primary font-display text-sm font-bold text-primary-foreground"
            >
              AI
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Aesthetic Index
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 lg:block">
            <SiteSearch index={searchIndex} />
          </div>

          <nav aria-label="Primary" className="ml-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              <ExploreMenu index={searchIndex} />
              <li>
                <Link
                  to="/compare"
                  className="block rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  activeProps={{ className: "bg-secondary font-medium" }}
                >
                  Compare
                </Link>
              </li>
              <li>
                <Link
                  to="/prices"
                  className="block rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary"
                  activeProps={{ className: "bg-secondary font-medium" }}
                >
                  Local prices
                </Link>
              </li>
            </ul>
          </nav>

          <Link
            to="/compare"
            className="hidden shrink-0 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:inline-flex lg:hidden"
          >
            Compare
          </Link>
          <MobileMenu index={searchIndex} />
        </div>
        <div className="px-4 pb-3 lg:hidden">
          <SiteSearch index={searchIndex} />
        </div>
      </header>

      <main id="main" className="mx-auto max-w-7xl px-5 py-10 sm:py-14">
        {children}
      </main>

      <footer className="mt-16 border-t border-rule bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-10 text-sm text-muted-foreground">
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
              <Link to="/advertising-disclosure" className="hover:text-foreground">
                Advertising disclosure
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
