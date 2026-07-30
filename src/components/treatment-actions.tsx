import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Lock, X } from "lucide-react";
import { type ComparisonFamilyRule, type TreatmentPickerRecord } from "@/lib/content-types";
import { comparisonSlugForPair, listCompatibleTreatmentOptions } from "@/lib/comparison-model";
import { trackEvent } from "@/lib/analytics";

/** Pick a second treatment and jump to the canonical comparison URL. */
export function CompareWith({
  slug,
  name,
  treatments,
  familyRules,
}: {
  slug: string;
  name: string;
  treatments: TreatmentPickerRecord[];
  familyRules: ComparisonFamilyRule[];
}) {
  const [other, setOther] = useState("");
  const navigate = useNavigate();
  const selected = treatments.find((treatment) => treatment.slug === slug);
  const options = selected
    ? listCompatibleTreatmentOptions(selected, treatments, familyRules).map((option) => ({
        treatmentSlug: option.treatment.slug,
        name: option.treatment.name,
        comparisonSlug: comparisonSlugForPair(selected, option.treatment, option.compatibility),
      }))
    : [];
  const comparisonSlug = options.find((option) => option.treatmentSlug === other)?.comparisonSlug;

  if (!options.length) return null;

  return (
    <form
      className="flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!other || !comparisonSlug) return;
        trackEvent("compare_started", { from: slug, to: other });
        navigate({ to: "/compare/$slug", params: { slug: comparisonSlug } });
      }}
    >
      <label htmlFor="compare-with" className="sr-only">
        Compare {name} with another treatment
      </label>
      <select
        id="compare-with"
        value={other}
        onChange={(e) => setOther(e.target.value)}
        className="h-10 rounded-full border border-input bg-card px-4 text-sm focus-visible:outline-2 focus-visible:outline-primary"
      >
        <option value="">Compare with…</option>
        {options.map((t) => (
          <option key={t.treatmentSlug} value={t.treatmentSlug}>
            {t.name}
          </option>
        ))}
      </select>
      <button
        type="submit"
        className="inline-flex h-10 items-center rounded-full border border-input bg-card px-4 text-sm font-medium hover:border-primary"
      >
        Compare
      </button>
    </form>
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
