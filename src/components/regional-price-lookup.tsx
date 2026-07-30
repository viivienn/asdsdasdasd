import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { fetchRegionalPriceEstimate } from "@/lib/content.functions";
import type { RegionalPriceResult } from "@/lib/content-types";
import { FEATURES } from "@/lib/features";

type TreatmentOption = { id: string; slug: string; name: string };

export function RegionalPriceLookup({ treatments }: { treatments: TreatmentOption[] }) {
  const [postalCode, setPostalCode] = useState("");
  const [treatmentSlug, setTreatmentSlug] = useState(treatments[0]?.slug ?? "");
  const [result, setResult] = useState<RegionalPriceResult | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const lookup = useServerFn(fetchRegionalPriceEstimate);

  if (!FEATURES.regionalPriceEstimates || treatments.length === 0) return null;
  const selectedName =
    treatments.find((treatment) => treatment.slug === treatmentSlug)?.name ?? "Treatment";

  return (
    <section className="rounded-2xl border border-rule bg-card p-5" aria-labelledby="price-lookup">
      <h2 id="price-lookup" className="font-display text-2xl">
        See average treatment prices near you
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Enter a US ZIP code or Canadian postal code to check our stored estimate for the surrounding
        market.
      </p>

      <form
        className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
        onSubmit={async (event) => {
          event.preventDefault();
          setError("");
          setPending(true);
          try {
            const response = await lookup({ data: { postalCode, treatmentSlug } });
            if (!response.ok) {
              setResult(null);
              setError(response.error);
            } else {
              setResult(response.result);
            }
          } finally {
            setPending(false);
          }
        }}
      >
        {treatments.length > 1 ? (
          <label className="text-sm font-medium">
            Treatment
            <select
              value={treatmentSlug}
              onChange={(event) => {
                setTreatmentSlug(event.target.value);
                setResult(null);
              }}
              className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3"
            >
              {treatments.map((treatment) => (
                <option key={treatment.id} value={treatment.slug}>
                  {treatment.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <input type="hidden" value={treatmentSlug} />
        )}
        <label className="text-sm font-medium">
          ZIP or postal code
          <input
            required
            value={postalCode}
            onChange={(event) => setPostalCode(event.target.value)}
            autoComplete="postal-code"
            placeholder="94063 or M5V 2T6"
            className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 self-end rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Checking…" : "See local estimate"}
        </button>
      </form>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-rose-foreground">
          {error}
        </p>
      ) : null}
      {result ? <EstimateResult result={result} treatmentName={selectedName} /> : null}
    </section>
  );
}

function EstimateResult({
  result,
  treatmentName,
}: {
  result: RegionalPriceResult;
  treatmentName: string;
}) {
  if (!result.estimate) {
    return (
      <div role="status" className="mt-5 rounded-xl bg-muted p-4 text-sm">
        We do not have a researched {treatmentName} estimate for {result.regionName} yet.
      </div>
    );
  }
  const estimate = result.estimate;
  const money = (value: string) =>
    new Intl.NumberFormat(result.countryCode === "CA" ? "en-CA" : "en-US", {
      style: "currency",
      currency: estimate.currency,
      maximumFractionDigits: 0,
    }).format(Number(value));

  return (
    <div role="status" className="mt-5 rounded-xl border border-rule bg-muted/45 p-4">
      <h3 className="font-medium">
        Estimated {treatmentName} price near {result.postalCode}
      </h3>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        {estimate.estimated_average ? (
          <div>
            <dt className="text-muted-foreground">Estimated average</dt>
            <dd className="mt-1 text-lg font-semibold">{money(estimate.estimated_average)}</dd>
          </div>
        ) : null}
        {estimate.estimated_median ? (
          <div>
            <dt className="text-muted-foreground">Estimated median</dt>
            <dd className="mt-1 text-lg font-semibold">{money(estimate.estimated_median)}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-muted-foreground">Estimated range</dt>
          <dd className="mt-1 text-lg font-semibold">
            {money(estimate.estimated_low)}–{money(estimate.estimated_high)}
          </dd>
        </div>
      </dl>
      <dl className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-foreground">Pricing basis: </dt>
          <dd className="inline">{estimate.pricing_unit.replace(/_/g, " ")}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Surrounding region: </dt>
          <dd className="inline">{estimate.region_name}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Sources reviewed: </dt>
          <dd className="inline">{estimate.source_count}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-foreground">Research date: </dt>
          <dd className="inline">{estimate.researched_at}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-muted-foreground">{estimate.methodology_note}</p>
      <p className="mt-2 text-xs text-muted-foreground">Limitations: {estimate.limitations}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        This estimate uses pricing from the surrounding market associated with your ZIP or postal
        code. It may not represent providers located inside that exact postal area.
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Estimated market range based on publicly available sources reviewed on the date shown. This
        is not a quote. Actual cost varies by provider, treatment area, quantity, product,
        promotions, membership, and individual treatment needs.
      </p>
    </div>
  );
}
