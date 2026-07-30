import type { PriceObservation } from "@/lib/content-types";

export function VerificationBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    unverified: "Unverified",
    source_checked: "Source checked",
    clinic_confirmed: "Confirmed with clinic",
    expired: "Expired listing",
  };
  return (
    <span className="inline-flex border border-rule bg-muted px-2 py-0.5 text-xs text-muted-foreground">
      {map[status] ?? "Unverified"}
    </span>
  );
}

export function FreshnessBadge({ observedAt }: { observedAt: string }) {
  const days = Math.max(0, Math.round((Date.now() - new Date(observedAt).getTime()) / 86_400_000));
  const label =
    days === 0 ? "Observed today" : days === 1 ? "Observed yesterday" : `Observed ${days} days ago`;
  return (
    <span className="inline-flex border border-rule bg-card px-2 py-0.5 text-xs text-muted-foreground">
      {label}
    </span>
  );
}

export function ClinicCard({
  name,
  website,
  addressLine,
}: {
  name: string;
  website?: string | null;
  addressLine?: string | null;
}) {
  return (
    <article className="border border-rule bg-card p-4">
      <h3 className="text-lg">{name}</h3>
      {addressLine ? <p className="mt-1 text-sm text-muted-foreground">{addressLine}</p> : null}
      {website ? (
        <a
          href={website}
          rel="nofollow noopener"
          className="mt-2 inline-block text-sm underline underline-offset-4"
        >
          Clinic website
        </a>
      ) : null}
    </article>
  );
}

export function OfferCard({
  title,
  description,
  window,
}: {
  title: string;
  description: string;
  window: string;
}) {
  return (
    <article className="border border-rule bg-card p-4">
      <h3 className="text-lg">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <p className="mt-2 text-xs text-muted-foreground">Valid {window}</p>
    </article>
  );
}

export function EmptyCoverage({ city, treatment }: { city: string; treatment: string }) {
  return (
    <div className="border border-rule bg-card p-6">
      <h2 className="text-xl">
        No published {treatment} prices for {city} yet
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        We only publish prices that a clinic has listed publicly, with a link to the page where we
        found the amount and the date we observed it. Nothing meets that bar for this page yet, so
        we are showing nothing rather than an estimate.
      </p>
    </div>
  );
}

export function LocalPriceSummary({ observations }: { observations: PriceObservation[] }) {
  if (observations.length === 0) return null;
  return (
    <div className="border border-rule bg-card p-4 text-sm">
      <p>
        <strong>{observations.length}</strong> publicly listed{" "}
        {observations.length === 1 ? "price" : "prices"} on file. Each is a single advertised amount
        recorded on a specific date — not a market average.
      </p>
    </div>
  );
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

/**
 * Documented summary of the local pricing dataset. Units are never mixed: one
 * block per pricing unit, and a median is only shown with enough observations.
 */
export function PriceDatasetSummary({
  city,
  treatment,
  observations,
  clinicsChecked,
  clinicsWithPublicPrices,
}: {
  city: string;
  treatment: string;
  observations: PriceObservation[];
  clinicsChecked: number;
  clinicsWithPublicPrices: number;
}) {
  if (observations.length === 0) return null;

  const units = [...new Set(observations.map((o) => o.pricing_unit))];
  const dates = observations.map((o) => o.observed_at).sort();
  const collected = dates[0]!.slice(0, 10);
  const refreshed = dates[dates.length - 1]!.slice(0, 10);

  return (
    <section className="border border-rule bg-card p-5 text-sm">
      <h2 className="text-xl">
        {treatment} pricing dataset — {city}
      </h2>
      <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Geographic scope</dt>
          <dd>{city}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Treatment</dt>
          <dd>{treatment}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Pricing basis</dt>
          <dd>Publicly advertised clinic prices</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Clinics checked</dt>
          <dd>{clinicsChecked}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Clinics with usable public prices</dt>
          <dd>{clinicsWithPublicPrices}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Observations included</dt>
          <dd>{observations.length}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Collection date</dt>
          <dd>{collected}</dd>
        </div>
        <div className="flex justify-between gap-4 border-b border-rule py-1">
          <dt className="text-muted-foreground">Last refreshed</dt>
          <dd>{refreshed}</dd>
        </div>
      </dl>

      <div className="mt-5 space-y-3">
        {units.map((unit) => {
          const rows = observations.filter((o) => o.pricing_unit === unit);
          const currency = rows[0]?.currency ?? "USD";
          const amounts = rows
            .map((o) => Number(o.effective_unit_price ?? o.advertised_amount))
            .filter((n) => Number.isFinite(n));
          const med = amounts.length >= 5 ? median(amounts) : null;
          const low = Math.min(...amounts);
          const high = Math.max(...amounts);
          return (
            <div key={unit} className="border border-rule p-3">
              <p className="font-medium">Priced {unit.replace(/_/g, " ")}</p>
              <p className="mt-1 text-muted-foreground">
                {rows.length} observation{rows.length === 1 ? "" : "s"} · observed range{" "}
                {money(low, currency)}–{money(high, currency)}
                {med !== null ? ` · median ${money(med, currency)}` : ""}
              </p>
              {med === null ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  A median is withheld until at least five compatible observations exist.
                </p>
              ) : null}
            </div>
          );
        })}
        {units.length > 1 ? (
          <p className="text-xs text-muted-foreground">
            Pricing units are summarised separately and are not combined, because they are not
            comparable amounts.
          </p>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <h3 className="font-medium">Inclusion criteria</h3>
          <p className="mt-1 text-muted-foreground">
            A price is included when a clinic publishes it on a public page, the amount and unit are
            stated, and we can link to the page where we observed it.
          </p>
        </div>
        <div>
          <h3 className="font-medium">Exclusion criteria</h3>
          <p className="mt-1 text-muted-foreground">
            We exclude quoted-on-request pricing, prices given only by phone or DM, sample or
            placeholder records, and listings we could not re-verify at the source URL.
          </p>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-medium">Limitations</h3>
        <p className="mt-1 text-muted-foreground">
          This is a snapshot of advertised prices in one city, not a market average. Advertised
          amounts are frequently starting prices, may exclude consultation or product fees, and can
          change without notice. Clinics that do not publish prices are absent from the dataset.
        </p>
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Each observation links to its own source below.
      </p>
    </section>
  );
}

export function PriceObservationTable({ observations }: { observations: PriceObservation[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Publicly advertised prices with source and observation date
        </caption>
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="py-2 pr-4 font-medium">
              Clinic
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Advertised
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Unit
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Conditions
            </th>
            <th scope="col" className="py-2 pr-4 font-medium">
              Source
            </th>
          </tr>
        </thead>
        <tbody>
          {observations.map((o) => {
            const flags = [
              o.starts_at_price ? "Starts-at price" : null,
              o.new_customer_only ? "New clients only" : null,
              o.membership_required ? "Membership required" : null,
              o.manufacturer_reward_required ? "Manufacturer rewards required" : null,
              o.minimum_purchase ? `Minimum: ${o.minimum_purchase}` : null,
            ].filter(Boolean) as string[];
            return (
              <tr key={o.id} className="border-b border-rule align-top">
                <th scope="row" className="py-3 pr-4 text-left font-normal">
                  {o.clinic_name}
                </th>
                <td className="py-3 pr-4">
                  {o.currency} {o.advertised_amount}
                  {o.effective_unit_price ? (
                    <span className="block text-xs text-muted-foreground">
                      ≈ {o.currency} {o.effective_unit_price} per {o.pricing_unit}
                    </span>
                  ) : null}
                </td>
                <td className="py-3 pr-4">
                  {o.pricing_unit}
                  {o.quantity ? ` × ${o.quantity}` : ""}
                  {o.treatment_area ? (
                    <span className="block text-xs text-muted-foreground">{o.treatment_area}</span>
                  ) : null}
                </td>
                <td className="py-3 pr-4">
                  {flags.length ? (
                    <ul className="space-y-0.5 text-xs text-muted-foreground">
                      {flags.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-muted-foreground">None listed</span>
                  )}
                  {o.conditions ? (
                    <p className="mt-1 text-xs text-muted-foreground">{o.conditions}</p>
                  ) : null}
                </td>
                <td className="py-3 pr-4">
                  <a
                    href={o.source_url}
                    rel="nofollow noopener"
                    className="underline underline-offset-4"
                  >
                    Listing
                  </a>
                  <span className="mt-1 flex flex-wrap gap-1">
                    <FreshnessBadge observedAt={o.observed_at} />
                    <VerificationBadge status={o.verification_status} />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
