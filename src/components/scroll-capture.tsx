import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitCityRequest } from "@/lib/content.functions";
import { trackEvent } from "@/lib/analytics";

const DISMISS_KEY = "ai_scroll_capture_dismissed";

/**
 * Scroll-triggered demand capture.
 *
 * Deliberately NOT a content gate and NOT an account wall: Aesthetic Index has
 * no public registration, and every published page stays fully readable and
 * crawlable. The prompt only offers to email the reader when verified local
 * pricing reaches their area.
 */
export function ScrollCapture({
  treatments = [],
}: {
  treatments?: Array<{ slug: string; name: string }>;
}) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [treatment, setTreatment] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dismissed = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const cityRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const returnFocusRef = useRef<Element | null>(null);
  const submit = useServerFn(submitCityRequest);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      /* storage unavailable — still fine to show once */
    }

    const onScroll = () => {
      if (dismissed.current) return;
      const scrolled = window.scrollY + window.innerHeight;
      const total = document.documentElement.scrollHeight;
      if (total > window.innerHeight * 1.4 && scrolled / total > 0.45) {
        setVisible(true);
        trackEvent("scroll_prompt_impression", {
          path: window.location.pathname,
          scroll_depth: 45,
        });
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Remember where focus was, then move it into the panel when it appears.
  useEffect(() => {
    if (!visible) return;
    returnFocusRef.current = document.activeElement;
    emailRef.current?.focus();
  }, [visible]);

  // Move focus to the field that starts each subsequent step / the confirmation.
  useEffect(() => {
    if (!visible) return;
    if (done) statusRef.current?.focus();
    else if (step === 2) cityRef.current?.focus();
  }, [visible, step, done]);

  // Escape dismisses the prompt from anywhere inside it.
  useEffect(() => {
    if (!visible) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const panel = panelRef.current;
      if (!panel) return;
      if (panel.contains(document.activeElement)) {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  });

  function close() {
    dismissed.current = true;
    setVisible(false);
    const previous = returnFocusRef.current;
    if (previous instanceof HTMLElement && document.contains(previous)) {
      previous.focus();
    }
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-4 sm:pb-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-labelledby="sc-heading"
        aria-describedby="sc-description"
        className="pointer-events-auto w-full max-w-xl card-soft animate-fade-in p-5 shadow-lg"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Local pricing
            </p>
            <h2 id="sc-heading" className="mt-1 font-display text-lg">
              {done ? "You're on the list" : "Get notified when we verify prices near you"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss local pricing updates"
            className="-mr-2 -mt-2 inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        {done ? (
          <p
            id="sc-description"
            ref={statusRef}
            tabIndex={-1}
            role="status"
            aria-live="polite"
            className="mt-2 text-sm text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Thanks — we'll email you once publicly listed prices are verified for{" "}
            {treatmentLabel(treatment, treatments)} in {city || "your area"}. Nothing on this site
            is hidden behind an account.
          </p>
        ) : step === 1 ? (
          <>
            <p id="sc-description" className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Step 1 of 2</span> — where should we
              send alerts? Coverage is live for San Francisco and expands by demand. Every page
              stays free to read — no account required.
            </p>
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                trackEvent("scroll_prompt_step_completed", { step: 1, has_postal_code: true });
                setStep(2);
              }}
            >
              <label className="sr-only" htmlFor="sc-email">
                Email
              </label>
              <input
                id="sc-email"
                ref={emailRef}
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                aria-required="true"
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "sc-error" : "sc-consent-note"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              />
              <label className="sr-only" htmlFor="sc-zip">
                ZIP code
              </label>
              <input
                id="sc-zip"
                name="postal_code"
                required
                autoComplete="postal-code"
                inputMode="numeric"
                aria-required="true"
                aria-invalid={error ? true : undefined}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="ZIP"
                className="w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:w-28"
              />
              <button
                type="submit"
                className="shrink-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Continue
              </button>
            </form>
            <p id="sc-consent-note" className="mt-2 text-xs text-muted-foreground">
              By continuing you agree to be emailed about pricing coverage. Educational information
              only — not medical advice.
            </p>
          </>
        ) : (
          <>
            <p id="sc-description" className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Step 2 of 2</span> — which city and
              treatment should we watch? This keeps your alerts targeted; you can leave either blank
              for all coverage near {postalCode}.
            </p>
            <form
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError(null);
                const fd = new FormData(e.currentTarget);
                trackEvent("scroll_prompt_submitted", {
                  has_city: Boolean(city),
                  treatment_slug: treatment || "any",
                });
                try {
                  const res = await submit({
                    data: {
                      email,
                      postal_code: postalCode,
                      city,
                      treatment_slug: treatment,
                      consent: true,
                      source_path: window.location.pathname,
                      company: String(fd.get("company") ?? ""),
                    },
                  });
                  if (res.ok) {
                    trackEvent("alert_signup_success", {
                      source: "scroll_prompt",
                      has_city: Boolean(city),
                      treatment_slug: treatment || "any",
                    });
                    setDone(true);
                  } else {
                    setError(res.error ?? "Something went wrong.");
                  }
                } catch {
                  setError("Please check your details and try again.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div>
                <label className="text-xs font-medium" htmlFor="sc-city">
                  City <span className="text-muted-foreground">(optional)</span>
                </label>
                <input
                  id="sc-city"
                  ref={cityRef}
                  name="city"
                  autoComplete="address-level2"
                  maxLength={80}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                />
              </div>
              <div>
                <label className="text-xs font-medium" htmlFor="sc-treatment">
                  Treatment <span className="text-muted-foreground">(optional)</span>
                </label>
                <select
                  id="sc-treatment"
                  name="treatment_slug"
                  value={treatment}
                  onChange={(e) => setTreatment(e.target.value)}
                  className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <option value="">Any treatment</option>
                  {treatments.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="hidden" aria-hidden="true">
                <label htmlFor="sc-company">Company</label>
                <input id="sc-company" name="company" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="flex items-center gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
                >
                  {busy ? "Sending…" : "Notify me"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep(1);
                  }}
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  Back
                </button>
              </div>
            </form>
            <p
              id="sc-error"
              role="alert"
              aria-live="assertive"
              className="mt-2 text-sm text-destructive empty:mt-0"
            >
              {error}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function treatmentLabel(slug: string, treatments: Array<{ slug: string; name: string }>) {
  if (!slug) return "your treatments";
  return treatments.find((t) => t.slug === slug)?.name ?? slug;
}
