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
  const days = Math.max(
    0,
    Math.round((Date.now() - new Date(observedAt).getTime()) / 86_400_000),
  );
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
      {addressLine ? (
        <p className="mt-1 text-sm text-muted-foreground">{addressLine}</p>
      ) : null}
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

export function EmptyCoverage({
  city,
  treatment,
}: {
  city: string;
  treatment: string;
}) {
  return (
    <div className="border border-rule bg-card p-6">
      <h2 className="text-xl">No published {treatment} prices for {city} yet</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        We only publish prices that a clinic has listed publicly, with a link to the page where we
        found the amount and the date we observed it. Nothing meets that bar for this page yet, so
        we are showing nothing rather than an estimate.
      </p>
    </div>
  );
}

export function LocalPriceSummary({
  observations,
}: {
  observations: PriceObservation[];
}) {
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

export function PriceObservationTable({
  observations,
}: {
  observations: PriceObservation[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">
          Publicly advertised prices with source and observation date
        </caption>
        <thead>
          <tr className="border-b border-rule text-left">
            <th scope="col" className="py-2 pr-4 font-medium">Clinic</th>
            <th scope="col" className="py-2 pr-4 font-medium">Advertised</th>
            <th scope="col" className="py-2 pr-4 font-medium">Unit</th>
            <th scope="col" className="py-2 pr-4 font-medium">Conditions</th>
            <th scope="col" className="py-2 pr-4 font-medium">Source</th>
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