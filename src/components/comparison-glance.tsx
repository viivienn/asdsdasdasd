import type { Treatment, TreatmentMedia } from "@/lib/content-types";
import { GLANCE_FIELDS } from "@/lib/content-types";
import type { RowTemplate } from "@/lib/comparison-templates";

function value(t: Treatment | null, key: keyof Treatment) {
  const v = t?.[key];
  if (typeof v !== "string" || v.trim() === "") return null;
  return v;
}

function MediaFigure({ media }: { media: TreatmentMedia | null }) {
  if (!media) return null;
  return (
    <figure className="mb-3">
      <img
        src={media.url}
        alt={media.alt_text}
        loading="lazy"
        className="h-28 w-full rounded-lg border border-rule object-contain bg-muted p-2"
      />
      <figcaption className="mt-1 text-[0.7rem] text-muted-foreground">
        {media.credit} ·{" "}
        <a href={media.source_url} rel="nofollow noopener" target="_blank" className="underline">
          source
        </a>
      </figcaption>
    </figure>
  );
}

/**
 * The at-a-glance card: one column per treatment, a handful of template
 * attributes, and the shared at-a-glance summary. Every state is text-labelled.
 */
export function ComparisonGlance({
  a,
  b,
  nameA,
  nameB,
  template,
  oneLine,
  media,
}: {
  a: Treatment | null;
  b: Treatment | null;
  nameA: string;
  nameB: string;
  template: RowTemplate;
  oneLine: string | null;
  media: Record<string, TreatmentMedia>;
}) {
  const columns = [
    { t: a, name: nameA },
    { t: b, name: nameB },
  ];

  return (
    <section aria-labelledby="at-a-glance" className="mt-6 rounded-xl border border-rule bg-card p-5">
      <h2 id="at-a-glance" className="text-xl">
        At a glance
      </h2>

      {oneLine ? <p className="mt-2 max-w-3xl text-[0.95rem]">{oneLine}</p> : null}

      {!template.likeForLike ? (
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          These two are in different categories, so the rows below describe each one on its own
          terms rather than as direct substitutes.
        </p>
      ) : null}

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        {columns.map(({ t, name }) => (
          <div key={name}>
            <MediaFigure media={(t && media[t.id]) || null} />
            <h3 className="text-base font-medium">{name}</h3>
            {t?.category ? (
              <p className="mt-0.5 text-xs uppercase tracking-wider text-muted-foreground">
                {t.category}
              </p>
            ) : null}
            <dl className="mt-3 space-y-2 text-sm">
              {template.glance.map((row) => (
                <div key={String(row.key)} className="grid grid-cols-[10rem_1fr] gap-2">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd>{value(t, row.key) ?? <span className="text-muted-foreground">—</span>}</dd>
                </div>
              ))}
              {GLANCE_FIELDS.map((f) => {
                const v = t?.at_a_glance?.[f.key];
                if (!v) return null;
                return (
                  <div key={f.key} className="grid grid-cols-[10rem_1fr] gap-2">
                    <dt className="text-muted-foreground">{f.label}</dt>
                    <dd>{v}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}