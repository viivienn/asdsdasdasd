import type { ReactNode } from "react";

export function SectionHeading({
  children,
  as: As = "h2",
}: {
  children: ReactNode;
  as?: "h2" | "h3";
}) {
  return <As className="text-2xl sm:text-[1.75rem]">{children}</As>;
}

/** Evidence / sourcing state. Always carries a text label, never colour alone. */
export function EvidenceState({
  state,
}: {
  state: "unsourced" | "sourced" | "reviewed";
}) {
  const copy = {
    unsourced: {
      label: "Not yet sourced",
      detail: "No citation recorded for this claim.",
      className: "border-rule bg-muted text-muted-foreground",
    },
    sourced: {
      label: "Source recorded",
      detail: "A public source is on file.",
      className: "border-rule bg-accent text-accent-foreground",
    },
    reviewed: {
      label: "Editorially reviewed",
      detail: "Reviewed against the recorded sources.",
      className: "border-rule bg-accent text-accent-foreground",
    },
  }[state];

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs ${copy.className}`}
      title={copy.detail}
    >
      {copy.label}
    </span>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl space-y-4 text-[0.95rem] leading-relaxed text-foreground">
      {children}
    </div>
  );
}

/** Wrapper marking a component as a preview of a not-yet-live feature. */
export function FeaturePreview({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-dashed border-input bg-card p-4">
      <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
        Preview of a feature in development — {title}
      </p>
      {children}
    </section>
  );
}