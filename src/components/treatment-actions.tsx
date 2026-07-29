import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, ChevronRight, GitCompare, Lock, Plus, Search, X } from "lucide-react";
import {
  canonicalPairSlug,
  directCompatibleComparisons,
  type AvailableComparison,
  type TreatmentPickerRecord,
} from "@/lib/content-types";
import { TreatmentVisual } from "@/components/treatment-visual";
import { trackEvent } from "@/lib/analytics";

/** Skinsort-style compare sheet: pick a second treatment, jump to the canonical comparison URL. */
export function CompareWith({
  slug,
  name,
  treatments,
  comparisons,
}: {
  slug: string;
  name: string;
  treatments: TreatmentPickerRecord[];
  comparisons: AvailableComparison[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [other, setOther] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const current = treatments.find((treatment) => treatment.slug === slug);

  const options = useMemo(() => {
    const reviewed = new Map(
      directCompatibleComparisons(slug, treatments, comparisons).map((pair) => [
        pair.treatmentSlug,
        pair.comparisonSlug,
      ]),
    );
    const groups = new Set(current?.comparison_groups ?? []);
    return treatments
      .filter((treatment) => treatment.slug !== slug)
      .filter(
        (treatment) =>
          reviewed.has(treatment.slug) ||
          treatment.comparison_groups.some((group) => groups.has(group)),
      )
      .map((treatment) => ({
        treatment,
        comparisonSlug: reviewed.get(treatment.slug) ?? canonicalPairSlug(slug, treatment.slug),
        reviewed: reviewed.has(treatment.slug),
      }))
      .sort((a, b) => Number(b.reviewed) - Number(a.reviewed) || a.treatment.name.localeCompare(b.treatment.name));
  }, [comparisons, current, slug, treatments]);

  const visible = options.filter(({ treatment }) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return `${treatment.name} ${treatment.category ?? ""} ${treatment.brand_name ?? ""}`
      .toLowerCase()
      .includes(q);
  });
  const selected = options.find((option) => option.treatment.slug === other);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  if (!options.length) return null;

  function close() {
    setOpen(false);
    setQuery("");
    setOther("");
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-input bg-card px-4 text-sm font-medium transition-colors hover:border-primary"
      >
        <GitCompare aria-hidden="true" className="size-4" />
        Compare
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-foreground/40 p-0 sm:place-items-center sm:p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-sheet-heading"
            className="flex h-[88dvh] w-full max-w-lg flex-col rounded-t-2xl bg-card shadow-lift sm:h-[70dvh] sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-rule p-4">
              <div className="min-w-0">
                <h2 id="compare-sheet-heading" className="font-display text-lg">
                  Compare {name} with…
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Similar options in the same comparison group.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={close}
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-4 pb-2">
              <label className="flex h-11 items-center gap-2 rounded-full border border-input bg-background px-4">
                <Search aria-hidden="true" className="size-4 text-muted-foreground" />
                <span className="sr-only">Search treatments to compare</span>
                <input
                  ref={inputRef}
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search for something to compare"
                  className="w-full bg-transparent text-sm outline-none [&::-webkit-search-cancel-button]:hidden"
                />
              </label>
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {visible.map(({ treatment, reviewed }) => {
                const isSelected = other === treatment.slug;
                return (
                  <li key={treatment.id}>
                    <button
                      type="button"
                      onClick={() => setOther(isSelected ? "" : treatment.slug)}
                      aria-pressed={isSelected}
                      className={`flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors ${
                        isSelected ? "bg-secondary" : "hover:bg-muted"
                      }`}
                    >
                      <TreatmentVisual name={treatment.name} media={treatment.media} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{treatment.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {treatment.category}
                          {reviewed ? " · Reviewed comparison" : ""}
                        </span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`grid size-8 shrink-0 place-items-center rounded-full ${
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "border border-rule text-muted-foreground"
                        }`}
                      >
                        {isSelected ? <Check className="size-4" /> : <Plus className="size-4" />}
                      </span>
                    </button>
                  </li>
                );
              })}
              {visible.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Nothing matches that search.
                </li>
              ) : null}
            </ul>

            <div className="border-t border-rule p-4">
              <button
                type="button"
                disabled={!selected}
                onClick={() => {
                  if (!selected) return;
                  trackEvent("compare_started", { from: slug, to: selected.treatment.slug });
                  setOpen(false);
                  navigate({ to: "/compare/$slug", params: { slug: selected.comparisonSlug } });
                }}
                className="h-11 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-40"
              >
                {selected ? `Compare with ${selected.treatment.name}` : "Select something to compare"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Locked personalisation teaser. Opens a sign-up prompt; never gates editorial content. */
export function MatchGate({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) emailRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(true);
          trackEvent("match_gate_opened", { treatment: name });
        }}
        className="flex w-full items-center justify-between gap-4 rounded-xl border border-rule bg-secondary px-4 py-4 text-left transition-colors hover:border-primary"
      >
        <span>
          <span className="flex items-center gap-1.5 font-medium text-primary">
            See if {name} fits what you are asking for
            <ChevronRight className="size-4" aria-hidden="true" />
          </span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Save treatments, track local prices, and prepare consultation questions.
          </span>
        </span>
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-primary"
        >
          <Lock className="size-5" />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="match-gate-heading"
            className="relative w-full max-w-md rounded-2xl bg-card p-6 shadow-lift"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-muted-foreground hover:text-foreground"
            >
              <X className="size-5" />
            </button>
            <h2 id="match-gate-heading" className="font-display text-2xl">
              Create a free account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Saving treatments and local price tracking are coming soon. Leave an email and we will
              let you know when it opens. Everything already on this page stays free to read.
            </p>
            {done ? (
              <p role="status" className="mt-5 text-sm font-medium">
                You are on the list. No spam, and you can unsubscribe any time.
              </p>
            ) : (
              <form
                className="mt-5 space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  setDone(true);
                  trackEvent("match_gate_signup", { treatment: name });
                }}
              >
                <label htmlFor="match-gate-email" className="block text-sm font-medium">
                  Email
                </label>
                <input
                  ref={emailRef}
                  id="match-gate-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"
                />
                <button
                  type="submit"
                  className="h-11 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Continue with email
                </button>
                <p className="text-xs text-muted-foreground">
                  We respect your privacy. Aesthetic Index does not give medical advice.
                </p>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
