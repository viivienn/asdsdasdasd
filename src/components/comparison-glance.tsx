import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Treatment, TreatmentMedia } from "@/lib/content-types";
import { displayValue, nonEmptyComparisonRows } from "@/lib/comparison-model";
import type { RowTemplate } from "@/lib/comparison-templates";
import { TreatmentVisual } from "@/components/treatment-visual";

export function ComparisonGlance({
  a,
  b,
  nameA,
  nameB,
  media,
  template,
}: {
  a: Treatment;
  b: Treatment;
  nameA: string;
  nameB: string;
  media: Record<string, TreatmentMedia>;
  template: RowTemplate;
}) {
  const rows = nonEmptyComparisonRows(a, b, template.glance);

  return (
    <>
      <section aria-label="Compared treatments" className="mt-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-5">
          <TreatmentHeader treatment={a} name={nameA} media={media[a.id] ?? null} />
          <TreatmentHeader treatment={b} name={nameB} media={media[b.id] ?? null} />
        </div>
      </section>

      {rows.length ? (
        <section
          id="quick-comparison"
          aria-labelledby="quick-comparison-heading"
          className="mt-7 scroll-mt-24"
        >
          <h2 id="quick-comparison-heading" className="font-display text-2xl">
            Quick comparison
          </h2>
          <QuickComparisonTable a={a} b={b} nameA={nameA} nameB={nameB} rows={rows} />
        </section>
      ) : null}

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
    <article className="flex min-w-0 max-w-full flex-col items-center gap-3 overflow-hidden rounded-2xl border border-rule bg-card p-3 text-center sm:flex-row sm:p-4 sm:text-left">
      <div className="w-fit shrink-0">
        <TreatmentVisual
          slug={treatment.slug}
          name={name}
          media={media}
          className="size-20 sm:size-24"
          showCredit
        />
      </div>
      <div className="w-full min-w-0">
        <h2 className="truncate font-display text-lg sm:text-xl">{name}</h2>
        <p className="mt-1 truncate text-xs uppercase tracking-[0.1em] text-muted-foreground">
          {treatment.manufacturer || treatment.brand_name || treatment.category}
        </p>
        {treatment.intended_areas.length ? (
          <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
            {displayValue(treatment, "intended_areas")}
          </p>
        ) : null}
      </div>
    </article>
  );
}

function QuickComparisonTable({
  a,
  b,
  nameA,
  nameB,
  rows,
}: {
  a: Treatment;
  b: Treatment;
  nameA: string;
  nameB: string;
  rows: Array<{ key: keyof Treatment; label: string }>;
}) {
  return (
    <div className="mt-4 min-w-0 max-w-full overflow-hidden rounded-2xl border border-rule bg-card">
      <table className="hidden w-full border-collapse text-sm md:table">
        <caption className="sr-only">
          Quick attribute comparison of {nameA} and {nameB}
        </caption>
        <thead>
          <tr className="border-b border-rule bg-muted/55 text-left">
            <th scope="col" className="w-[24%] px-4 py-3 font-medium">
              Attribute
            </th>
            <th scope="col" className="w-[38%] px-4 py-3 font-medium">
              {nameA}
            </th>
            <th scope="col" className="w-[38%] px-4 py-3 font-medium">
              {nameB}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key} className="border-b border-rule align-top last:border-0">
              <th
                scope="row"
                className="bg-muted/25 px-4 py-3 text-left font-medium text-muted-foreground"
              >
                {row.label}
              </th>
              <td className="px-4 py-3 leading-6">{displayValue(a, row.key)}</td>
              <td className="border-l border-rule px-4 py-3 leading-6">
                {displayValue(b, row.key)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="md:hidden">
        {rows.map((row) => (
          <section key={row.key} className="border-b border-rule last:border-0">
            <h3 className="bg-muted/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {row.label}
            </h3>
            <dl className="grid grid-cols-2 divide-x divide-rule">
              <div className="min-w-0 overflow-hidden px-3 py-3">
                <dt className="mb-1 text-xs font-medium text-muted-foreground">{nameA}</dt>
                <dd className="break-words text-sm leading-5 [overflow-wrap:anywhere]">
                  {displayValue(a, row.key)}
                </dd>
              </div>
              <div className="min-w-0 overflow-hidden px-3 py-3">
                <dt className="mb-1 text-xs font-medium text-muted-foreground">{nameB}</dt>
                <dd className="break-words text-sm leading-5 [overflow-wrap:anywhere]">
                  {displayValue(b, row.key)}
                </dd>
              </div>
            </dl>
          </section>
        ))}
      </div>
    </div>
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
  const cards = [
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

  if (cards.every((card) => !card.benefit && !card.tradeoffs.length)) return null;

  return (
    <section className="mt-8" aria-labelledby="tradeoffs-heading">
      <h2 id="tradeoffs-heading" className="font-display text-2xl">
        Benefits and trade-offs
      </h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.name} className="rounded-2xl border border-rule bg-card p-4">
            <h3 className="font-medium">{card.name}</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {card.benefit ? (
                <li className="flex gap-2 rounded-xl bg-sage px-3 py-2 text-sage-foreground">
                  <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0" />
                  <span>{card.benefit}</span>
                </li>
              ) : null}
              {card.tradeoffs.map((tradeoff) => (
                <li
                  key={tradeoff}
                  className="flex gap-2 rounded-xl bg-rose px-3 py-2 text-rose-foreground"
                >
                  <AlertCircle aria-hidden="true" className="mt-1 size-4 shrink-0" />
                  <span>{tradeoff}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
