import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitCityRequest } from "@/lib/content.functions";
import { TRENDING_TREATMENTS } from "@/lib/search-index";
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
export function ScrollCapture() {
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

  function close() {
    dismissed.current = true;
    setVisible(false);
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
        role="dialog"
        aria-label="Local pricing updates"
        className="pointer-events-auto w-full max-w-xl card-soft animate-fade-in p-5 shadow-lg"
        style={{ boxShadow: "var(--shadow-lift)" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              Local pricing
            </p>
            <h2 className="mt-1 font-display text-lg">
              {done ? "You're on the list" : "Get notified when we verify prices near you"}
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Dismiss"
            className="-mr-1 -mt-1 px-2 py-1 text-sm text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        {done ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Thanks — we'll email you once publicly listed prices are verified for{" "}
            {treatmentLabel(treatment)} in {city || "your area"}. Nothing on this site is hidden
            behind an account.
          </p>
        ) : step === 1 ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Step 1 of 2 — where should we send alerts? Coverage is live for San Francisco and
              expands by demand. Every page stays free to read — no account required.
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
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full border border-input bg-background px-3 py-2 text-sm"
              />
              <label className="sr-only" htmlFor="sc-zip">
                ZIP code
              </label>
              <input
                id="sc-zip"
                name="postal_code"
                required
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="ZIP"
                className="w-full border border-input bg-background px-3 py-2 text-sm sm:w-28"
              />
              <button
                type="submit"
                className="shrink-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Continue
              </button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              By continuing you agree to be emailed about pricing coverage. Educational information
              only — not medical advice.
            </p>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Step 2 of 2 — which city and treatment should we watch? This keeps your alerts
              targeted; you can leave either blank for all coverage near {postalCode}.
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
                  name="city"
                  maxLength={80}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="San Francisco"
                  className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm"
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
                  className="mt-1 w-full border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Any treatment</option>
                  {TRENDING_TREATMENTS.map((t) => (
                    <option key={t.slug} value={t.slug}>
                      {t.label}
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
                  className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
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
            {error ? (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

function treatmentLabel(slug: string) {
  if (!slug) return "your treatments";
  return TRENDING_TREATMENTS.find((t) => t.slug === slug)?.label ?? slug;
}
