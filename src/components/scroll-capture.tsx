import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitCityRequest } from "@/lib/content.functions";

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
            Thanks — we'll email you once publicly listed prices are verified in your area. Nothing
            on this site is hidden behind an account.
          </p>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Coverage is live for San Francisco and expands by demand. Every page stays free to
              read — no account required.
            </p>
            <form
              className="mt-4 flex flex-col gap-3 sm:flex-row"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError(null);
                const fd = new FormData(e.currentTarget);
                try {
                  const res = await submit({
                    data: {
                      email: String(fd.get("email") ?? ""),
                      postal_code: String(fd.get("postal_code") ?? ""),
                      city: "",
                      treatment_slug: "",
                      consent: true,
                      source_path: window.location.pathname,
                      company: String(fd.get("company") ?? ""),
                    },
                  });
                  if (res.ok) setDone(true);
                  else setError(res.error ?? "Something went wrong.");
                } catch {
                  setError("Please check your details and try again.");
                } finally {
                  setBusy(false);
                }
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
                placeholder="ZIP"
                className="w-full border border-input bg-background px-3 py-2 text-sm sm:w-28"
              />
              <div className="hidden" aria-hidden="true">
                <label htmlFor="sc-company">Company</label>
                <input id="sc-company" name="company" tabIndex={-1} autoComplete="off" />
              </div>
              <button
                type="submit"
                disabled={busy}
                className="shrink-0 bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
              >
                {busy ? "Sending…" : "Notify me"}
              </button>
            </form>
            {error ? (
              <p role="alert" className="mt-2 text-sm text-destructive">
                {error}
              </p>
            ) : null}
            <p className="mt-2 text-xs text-muted-foreground">
              By submitting you agree to be emailed about pricing coverage. Educational information
              only — not medical advice.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
