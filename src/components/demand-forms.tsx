import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitCityRequest, submitPriceAlertInterest } from "@/lib/content.functions";

const field =
  "w-full border border-input bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary";
const label = "block text-sm font-medium";
const button =
  "inline-flex items-center justify-center bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

export function CoverageRequestForm({ treatmentSlug }: { treatmentSlug?: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = useServerFn(submitCityRequest);

  if (done) {
    return (
      <p role="status" className="border border-rule bg-accent p-4 text-sm text-accent-foreground">
        Thanks. We'll use your request to prioritize pricing coverage in your area.
      </p>
    );
  }

  return (
    <div className="border border-rule bg-card p-5">
      <h2 className="text-xl">See publicly listed prices near you</h2>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">
        Local pricing currently covers the San Francisco Bay Area. Tell us where you are and we'll
        prioritise the next cities by demand.
      </p>
      {!open ? (
        <button type="button" className={`${button} mt-4`} onClick={() => setOpen(true)}>
          See publicly listed prices near you
        </button>
      ) : (
        <form
          className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2"
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
                  city: String(fd.get("city") ?? ""),
                  treatment_slug: treatmentSlug ?? "",
                  consent: fd.get("consent") === "on" ? true : (false as never),
                  source_path:
                    typeof window === "undefined" ? undefined : window.location.pathname,
                  company: String(fd.get("company") ?? ""),
                },
              });
              if (res.ok) setDone(true);
              else setError(res.error ?? "Something went wrong.");
            } catch {
              setError("Please check the form and try again.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <div>
            <label className={label} htmlFor="cr-email">
              Email
            </label>
            <input id="cr-email" name="email" type="email" required className={`${field} mt-1`} />
          </div>
          <div>
            <label className={label} htmlFor="cr-zip">
              ZIP code
            </label>
            <input id="cr-zip" name="postal_code" required className={`${field} mt-1`} />
          </div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="cr-city">
              City <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <input id="cr-city" name="city" className={`${field} mt-1`} />
          </div>
          <div className="hidden" aria-hidden="true">
            <label htmlFor="cr-company">Company</label>
            <input id="cr-company" name="company" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="sm:col-span-2 flex items-start gap-2">
            <input id="cr-consent" name="consent" type="checkbox" required className="mt-1" />
            <label htmlFor="cr-consent" className="text-sm">
              Email me once pricing coverage launches in my area.
            </label>
          </div>
          {error ? (
            <p role="alert" className="sm:col-span-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <button type="submit" className={button} disabled={busy}>
              {busy ? "Sending…" : "Request coverage"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export function PriceAlertForm({ treatmentSlug }: { treatmentSlug: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = useServerFn(submitPriceAlertInterest);

  if (done) {
    return (
      <p role="status" className="border border-rule bg-accent p-4 text-sm text-accent-foreground">
        Thanks — you're on the early-access list. We'll be in touch when price monitoring is live.
      </p>
    );
  }

  return (
    <div className="border border-rule bg-card p-5">
      <h2 className="text-xl">Notify me when prices change</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Price monitoring is in development. Join the early-access list.
      </p>
      <form
        className="mt-4 grid max-w-xl gap-4 sm:grid-cols-2"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          const fd = new FormData(e.currentTarget);
          const raw = String(fd.get("max_unit_price") ?? "").trim();
          try {
            const res = await submit({
              data: {
                email: String(fd.get("email") ?? ""),
                postal_code: String(fd.get("postal_code") ?? ""),
                treatment_slug: treatmentSlug,
                max_unit_price: raw ? Number(raw) : null,
                source_path: typeof window === "undefined" ? undefined : window.location.pathname,
                company: String(fd.get("company") ?? ""),
              },
            });
            if (res.ok) setDone(true);
            else setError(res.error ?? "Something went wrong.");
          } catch {
            setError("Please check the form and try again.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div>
          <label className={label} htmlFor="pa-email">
            Email
          </label>
          <input id="pa-email" name="email" type="email" required className={`${field} mt-1`} />
        </div>
        <div>
          <label className={label} htmlFor="pa-zip">
            ZIP code
          </label>
          <input id="pa-zip" name="postal_code" required className={`${field} mt-1`} />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="pa-max">
            Maximum price per unit{" "}
            <span className="font-normal text-muted-foreground">(optional, USD)</span>
          </label>
          <input
            id="pa-max"
            name="max_unit_price"
            type="number"
            min="1"
            step="1"
            className={`${field} mt-1`}
          />
        </div>
        <div className="hidden" aria-hidden="true">
          <label htmlFor="pa-company">Company</label>
          <input id="pa-company" name="company" tabIndex={-1} autoComplete="off" />
        </div>
        {error ? (
          <p role="alert" className="sm:col-span-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <button type="submit" className={button} disabled={busy}>
            {busy ? "Sending…" : "Join the early-access list"}
          </button>
        </div>
      </form>
    </div>
  );
}