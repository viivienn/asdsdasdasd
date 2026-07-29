import type { Comparison, Treatment, TreatmentSource } from "@/lib/content-types";
import { comparisonRowLabel, sourcePublisher } from "@/lib/content-types";
import type { RowTemplate } from "@/lib/comparison-templates";

function value(t: Treatment | null | undefined, key: keyof Treatment) {
  const result = t?.[key];
  return typeof result === "string" && result.trim() ? result.trim() : null;
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
          · {sourcePublisher(s.source_url)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Detail sections, collapsed by default. The content is
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
  comparison,
}: {
  a: Treatment | null;
  b: Treatment | null;
  nameA: string;
  nameB: string;
  template: RowTemplate;
  sources: TreatmentSource[];
  label: string;
  comparison?: Comparison | null;
}) {
  const sections = template.sections
    .map((section) => ({
      ...section,
      keys: section.keys.filter((key) => value(a, key) || value(b, key)),
    }))
    .filter((section) => section.keys.length > 0);
  const hasChoiceContext = Boolean(
    comparison?.consider_a_when ||
    comparison?.consider_b_when ||
    comparison?.neither_when ||
    comparison?.common_misconception,
  );

  if (sections.length === 0 && !hasChoiceContext) return null;

  return (
    <section className="mt-10">
      <h2 className="text-2xl">Details</h2>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        Open a section for more context. Sources appear beside the claims they support.
      </p>

      <div className="mt-4 divide-y divide-rule border-y border-rule">
        {hasChoiceContext ? (
          <details className="group">
            <summary className="cursor-pointer list-none py-3 text-base font-medium marker:hidden">
              <span className="inline-flex w-full items-center justify-between gap-3">
                How to think about the choice
                <DisclosureLabel />
              </span>
            </summary>
            <dl className="grid gap-4 pb-5 text-sm sm:grid-cols-2">
              {comparison?.consider_a_when ? (
                <div>
                  <dt className="font-medium">{nameA} may be considered when</dt>
                  <dd className="mt-1 leading-6 text-muted-foreground">
                    {comparison.consider_a_when}
                  </dd>
                </div>
              ) : null}
              {comparison?.consider_b_when ? (
                <div>
                  <dt className="font-medium">{nameB} may be considered when</dt>
                  <dd className="mt-1 leading-6 text-muted-foreground">
                    {comparison.consider_b_when}
                  </dd>
                </div>
              ) : null}
              {comparison?.neither_when ? (
                <div>
                  <dt className="font-medium">Neither may be a direct fit when</dt>
                  <dd className="mt-1 leading-6 text-muted-foreground">
                    {comparison.neither_when}
                  </dd>
                </div>
              ) : null}
              {comparison?.common_misconception ? (
                <div>
                  <dt className="font-medium">Common misconception</dt>
                  <dd className="mt-1 leading-6 text-muted-foreground">
                    {comparison.common_misconception}
                  </dd>
                </div>
              ) : null}
            </dl>
          </details>
        ) : null}

        {sections.map((section) => (
          <details key={section.id} id={section.id} className="group scroll-mt-24">
            <summary className="cursor-pointer list-none py-3 text-base font-medium marker:hidden">
              <span className="inline-flex w-full items-center justify-between gap-3">
                {section.title}
                <DisclosureLabel />
              </span>
            </summary>
            <div className="pb-5">
              <table className="hidden w-full border-collapse text-sm md:table">
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
                        {value(a, key)}
                        <RowSources sources={sources} treatmentId={a?.id} claim={key} />
                      </td>
                      <td className="py-3">
                        {value(b, key)}
                        <RowSources sources={sources} treatmentId={b?.id} claim={key} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="md:hidden">
                {section.keys.map((key) => (
                  <section key={String(key)} className="border-b border-rule last:border-0">
                    <h3 className="bg-muted/55 px-3 py-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      {comparisonRowLabel(key)}
                    </h3>
                    <dl className="grid grid-cols-2 divide-x divide-rule">
                      {[
                        { treatment: a, name: nameA },
                        { treatment: b, name: nameB },
                      ].map((item) => (
                        <div key={item.name} className="min-w-0 px-3 py-3">
                          <dt className="mb-1 text-xs font-medium text-muted-foreground">
                            {item.name}
                          </dt>
                          <dd className="text-sm leading-5">{value(item.treatment, key)}</dd>
                          <RowSources
                            sources={sources}
                            treatmentId={item.treatment?.id}
                            claim={key}
                          />
                        </div>
                      ))}
                    </dl>
                  </section>
                ))}
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

function DisclosureLabel() {
  return (
    <span aria-hidden="true" className="text-sm text-muted-foreground">
      <span className="group-open:hidden">Show</span>
      <span className="hidden group-open:inline">Hide</span>
    </span>
  );
}
