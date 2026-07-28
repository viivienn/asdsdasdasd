import type { Treatment, TreatmentSource } from "@/lib/content-types";
import { comparisonRowLabel, sourcePublisher } from "@/lib/content-types";
import type { RowTemplate } from "@/lib/comparison-templates";

function cell(t: Treatment | null | undefined, key: keyof Treatment) {
  const v = t?.[key];
  if (typeof v !== "string" || v.trim() === "") {
    return <span className="text-muted-foreground">Not yet recorded</span>;
  }
  return v;
}

function RowSources({
  sources,
  treatmentId,
  claim,
}: {
  sources: TreatmentSource[];
  treatmentId?: string;
  claim: keyof Treatment;
}) {
  if (!treatmentId) return null;
  const matches = sources.filter((s) => s.treatment_id === treatmentId && s.claim_field === claim);
  if (matches.length === 0) return null;
  return (
    <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
      {matches.map((s) => (
        <li key={s.id}>
          <a
            href={s.source_url}
            rel="nofollow noopener"
            target="_blank"
            className="underline underline-offset-2"
          >
            {s.source_title}
          </a>{" "}
          — {sourcePublisher(s.source_url)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Detail sections, collapsed by default apart from the first. The content is
 * server-rendered inside each <details>, so it is present in the initial HTML.
 */
export function ComparisonDetails({
  a,
  b,
  nameA,
  nameB,
  template,
  sources,
  label,
}: {
  a: Treatment | null;
  b: Treatment | null;
  nameA: string;
  nameB: string;
  template: RowTemplate;
  sources: TreatmentSource[];
  label: string;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-2xl">Full details</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Expand a section to see the attribute-by-attribute view. Where a claim has a recorded
        source, it is linked next to that value.
      </p>

      <div className="mt-4 divide-y divide-rule border-y border-rule">
        {template.sections.map((section, i) => (
          <details key={section.id} id={section.id} open={i === 0} className="group scroll-mt-24">
            <summary className="cursor-pointer list-none py-3 text-base font-medium marker:hidden">
              <span className="inline-flex w-full items-center justify-between gap-3">
                {section.title}
                <span aria-hidden="true" className="text-sm text-muted-foreground">
                  <span className="group-open:hidden">Show</span>
                  <span className="hidden group-open:inline">Hide</span>
                </span>
              </span>
            </summary>
            <div className="overflow-x-auto pb-5">
              <table className="w-full min-w-[36rem] border-collapse text-sm">
                <caption className="sr-only">
                  {label}: {section.title}
                </caption>
                <thead>
                  <tr className="border-b border-rule text-left">
                    <th scope="col" className="w-1/3 py-2 pr-4 font-medium">
                      Attribute
                    </th>
                    <th scope="col" className="py-2 pr-4 font-medium">
                      {nameA}
                    </th>
                    <th scope="col" className="py-2 font-medium">
                      {nameB}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {section.keys.map((key) => (
                    <tr key={String(key)} className="border-b border-rule align-top last:border-0">
                      <th
                        scope="row"
                        className="py-3 pr-4 text-left font-normal text-muted-foreground"
                      >
                        {comparisonRowLabel(key)}
                      </th>
                      <td className="py-3 pr-4">
                        {cell(a, key)}
                        <RowSources sources={sources} treatmentId={a?.id} claim={key} />
                      </td>
                      <td className="py-3">
                        {cell(b, key)}
                        <RowSources sources={sources} treatmentId={b?.id} claim={key} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}