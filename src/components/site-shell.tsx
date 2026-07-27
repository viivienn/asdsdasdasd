import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { FOOTER_DISCLAIMER } from "@/components/disclaimers";

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
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <header className="border-b border-rule">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-5 py-5 sm:flex-row sm:items-baseline sm:justify-between">
          <Link to="/" className="group">
            <span className="block font-display text-2xl leading-none">Aesthetic Index</span>
            <span className="mt-1 block text-xs tracking-wide text-muted-foreground">
              Compare before you book.
            </span>
          </Link>
          <nav aria-label="Primary">
            <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {NAV.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    params={"params" in item ? item.params : undefined}
                    className="border-b border-transparent pb-0.5 text-muted-foreground transition-colors hover:text-foreground"
                    activeProps={{ className: "border-primary text-foreground" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main" className="mx-auto max-w-5xl px-5 py-10 sm:py-14">
        {children}
      </main>

      <footer className="mt-16 border-t border-rule">
        <div className="mx-auto max-w-5xl px-5 py-8 text-sm text-muted-foreground">
          <p className="max-w-3xl">{FOOTER_DISCLAIMER}</p>
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
          </ul>
          <p className="mt-6 text-xs">© {new Date().getFullYear()} Aesthetic Index</p>
        </div>
      </footer>
    </div>
  );
}