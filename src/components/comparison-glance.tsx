import { AlertTriangle, Check, CircleSlash, Minus } from "lucide-react";
import { QUICK_COMPARISON_ROWS, type Treatment, type TreatmentMedia } from "@/lib/content-types";
import { displayValue, nonEmptyComparisonRows } from "@/lib/comparison-model";
import { TreatmentVisual } from "@/components/treatment-visual";

type Status = "yes" | "no" | "limited" | null;

/** Presentational only: reads a leading yes/no/limited word so the row can carry a symbol. */
function statusOf(value: string | null): Status {
  if (!value) return null;
  const head = value.toLowerCase().trimStart();
  if (/^(yes|reversible|approved|available)\b/.test(head)) return "yes";
  if (/^(no|not|none|irreversible|unavailable)\b/.test(head)) return "no";
  if (/^(limited|partial|partially|somewhat|varies|sometimes)\b/.test(head)) return "limited";
  return null;
}

function StatusMark({ status }: { status: Status }) {
  if (!status) return null;
  const config = {
    yes: { Icon: Check, className: "bg-sage text-sage-foreground", label: "Yes" },
    no: { Icon: CircleSlash, className: "bg-rose text-rose-foreground", label: "No" },
    limited: { Icon: Minus, className: "bg-muted text-muted-foreground", label: "Limited" },
  }[status];
  return (
    <span
      className={`mr-1.5 inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 align-middle text-[0.68rem] font-semibold uppercase tracking-[0.04em] ${config.className}`}
    >
      <config.Icon aria-hidden="true" className="size-3" />
      {config.label}
    </span>
  );
}

function Cell({ treatment, rowKey }: { treatment: Treatment; rowKey: keyof Treatment }) {
  const value = displayValue(treatment, rowKey);
  if (!value) return <span className="text-muted-foreground">—</span>;
  const status = statusOf(value);
  return (
    <>
      <StatusMark status={status} />
      <span>{value}</span>
    </>
  );
}

export function ComparisonGlance({
  a,
  b,
  nameA,
  nameB,
  oneLine,
  media,
}: {
  a: Treatment;
  b: Treatment;
  nameA: string;
  nameB: string;
  oneLine: string;
  media: Record<string, TreatmentMedia>;
}) {
  const rows = nonEmptyComparisonRows(a, b, QUICK_COMPARISON_ROWS);

  return (
    <>
      {oneLine ? (
        <section id="bottom-line" aria-labelledby="bottom-line-heading" className="mt-5 scroll-mt-24">
          <h2 id="bottom-line-heading" className="sr-only">
            Main difference
          </h2>
          <p className="max-w-3xl text-[0.95rem] leading-6 text-muted-foreground sm:text-base">
            {oneLine}
          </p>
        </section>
      ) : null}

      <section
        id="quick-comparison"
        aria-labelledby="quick-comparison-heading"
        className="mt-6 scroll-mt-24 border-y border-rule"
      >
        <h2 id="quick-comparison-heading" className="sr-only">
          Quick comparison
        </h2>

        <div className="grid grid-cols-2 divide-x divide-rule border-b border-rule">
          <TreatmentHeader treatment={a} name={nameA} media={media[a.id] ?? null} />
          <TreatmentHeader treatment={b} name={nameB} media={media[b.id] ?? null} />
        </div>

        <dl className="divide-y divide-rule">
          {rows.map((row) => (
            <div key={row.key} className="py-2.5">
              <dt className="px-3 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 grid grid-cols-2 divide-x divide-rule">
                <p className="min-w-0 break-words px-3 text-sm leading-6">
                  <span className="sr-only">{nameA}: </span>
                  <Cell treatment={a} rowKey={row.key} />
                </p>
                <p className="min-w-0 break-words px-3 text-sm leading-6">
                  <span className="sr-only">{nameB}: </span>
                  <Cell treatment={b} rowKey={row.key} />
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <BenefitsAndTradeoffs a={a} b={b} nameA={nameA} nameB={nameB} />
    </>
  );
}

function TreatmentHeader({
  treatment,
  name,
  media,
}: {
  treatment: Treatment;
  name: string;
  media: TreatmentMedia | null;
}) {
  return (
    <article className="flex min-w-0 flex-col items-center gap-2 px-3 py-4 text-center">
      <TreatmentVisual name={name} media={media} className="size-16 sm:size-20" />
      <h3 className="min-w-0 break-words font-display text-base leading-tight sm:text-lg">{name}</h3>
      <p className="min-w-0 break-words text-[0.68rem] uppercase tracking-[0.1em] text-muted-foreground">
        {treatment.manufacturer || treatment.brand_name || treatment.category}
      </p>
    </article>
  );
}

function BenefitsAndTradeoffs({
  a,
  b,
  nameA,
  nameB,
}: {
  a: Treatment;
  b: Treatment;
  nameA: string;
  nameB: string;
}) {
  const columns = [
    { treatment: a, name: nameA },
    { treatment: b, name: nameB },
  ].map(({ treatment, name }) => ({
    name,
    benefit: displayValue(treatment, "what_it_changes"),
    tradeoffs: [
      displayValue(treatment, "what_it_does_not_change"),
      displayValue(treatment, "most_likely_disappointment"),
    ].filter((value): value is string => Boolean(value)),
  }));

  if (columns.every((column) => !column.benefit && !column.tradeoffs.length)) return null;

  return (
    <section className="mt-8" aria-labelledby="tradeoffs-heading">
      <h2 id="tradeoffs-heading" className="text-xl">
        Benefits and trade-offs
      </h2>
      <div className="mt-3 grid gap-x-4 gap-y-5 sm:grid-cols-2">
        {columns.map((column) => (
          <div key={column.name} className="min-w-0">
            <h3 className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {column.name}
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm leading-6">
              {column.benefit ? (
                <li className="flex gap-2 rounded-lg bg-sage px-2.5 py-1.5 text-sage-foreground">
                  <Check aria-hidden="true" className="mt-1 size-3.5 shrink-0" />
                  <span className="min-w-0 break-words">{column.benefit}</span>
                </li>
              ) : null}
              {column.tradeoffs.map((tradeoff) => (
                <li
                  key={tradeoff}
                  className="flex gap-2 rounded-lg bg-rose px-2.5 py-1.5 text-rose-foreground"
                >
                  <AlertTriangle aria-hidden="true" className="mt-1 size-3.5 shrink-0" />
                  <span className="min-w-0 break-words">{tradeoff}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
