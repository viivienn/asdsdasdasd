import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitComparisonRequest } from "@/lib/content.functions";

const field =
  "w-full border border-input bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary";
const label = "block text-sm font-medium";
const button =
  "inline-flex items-center justify-center bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60";

export function ComparisonRequestForm({
  defaultA = "",
  defaultB = "",
  heading = "Can't find the comparison you need?",
  description = "Tell us which two treatments you want Aesthetic Index to research next. Requests help us prioritise; we can't promise a publication date.",
  submitLabel = "Request comparison",
}: {
  defaultA?: string;
  defaultB?: string;
  heading?: string;
  description?: string;
  submitLabel?: string;
} = {}) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = useServerFn(submitComparisonRequest);

  if (done) {
    return (
      <p role="status" className="border border-rule bg-accent p-4 text-sm text-accent-foreground">
        Request received. We'll use it to prioritize future research.
      </p>
    );
  }

  return (
    <div className="border border-rule bg-card p-5">
      <h2 className="text-xl">{heading}</h2>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">{description}</p>
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
                treatment_a: String(fd.get("treatment_a") ?? ""),
                treatment_b: String(fd.get("treatment_b") ?? ""),
                email: String(fd.get("email") ?? ""),
                context: String(fd.get("context") ?? ""),
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
          <label className={label} htmlFor="cq-a">
            Treatment A
          </label>
          <input
            id="cq-a"
            name="treatment_a"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaultA}
            className={`${field} mt-1`}
          />
        </div>
        <div>
          <label className={label} htmlFor="cq-b">
            Treatment B
          </label>
          <input
            id="cq-b"
            name="treatment_b"
            required
            minLength={2}
            maxLength={80}
            defaultValue={defaultB}
            className={`${field} mt-1`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="cq-email">
            Email <span className="text-muted-foreground">(optional)</span>
          </label>
          <input
            id="cq-email"
            name="email"
            type="email"
            maxLength={254}
            className={`${field} mt-1`}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={label} htmlFor="cq-context">
            Additional context <span className="text-muted-foreground">(optional)</span>
          </label>
          <textarea
            id="cq-context"
            name="context"
            rows={3}
            maxLength={1000}
            className={`${field} mt-1`}
          />
        </div>
        <div aria-hidden="true" className="hidden">
          <label htmlFor="cq-company">Company</label>
          <input id="cq-company" name="company" tabIndex={-1} autoComplete="off" />
        </div>
        {error ? (
          <p role="alert" className="sm:col-span-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <div className="sm:col-span-2">
          <button type="submit" className={button} disabled={busy}>
            {busy ? "Sending…" : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}
