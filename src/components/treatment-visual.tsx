import type { TreatmentMedia } from "@/lib/content-types";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TreatmentVisual({
  name,
  media,
  className = "size-16",
  showCredit = false,
}: {
  name: string;
  media: TreatmentMedia | null;
  className?: string;
  showCredit?: boolean;
}) {
  if (media) {
    return (
      <figure className="min-w-0">
        <img
          src={media.url}
          alt={media.alt_text}
          loading="lazy"
          className={`${className} rounded-xl border border-rule bg-card object-contain p-1`}
        />
        {showCredit ? (
          <figcaption className="mt-1 max-w-44 truncate text-[0.68rem] text-muted-foreground">
            {media.credit}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  return (
    <div
      role="img"
      aria-label={`Neutral placeholder illustration for ${name}`}
      className={`${className} relative grid shrink-0 place-items-center overflow-hidden rounded-xl border border-rule bg-muted text-sm font-semibold text-muted-foreground`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full text-primary/18"
      >
        <circle cx="28" cy="30" r="22" fill="currentColor" />
        <circle cx="75" cy="68" r="30" fill="currentColor" opacity="0.55" />
        <path d="M-8 82 C22 46 48 52 108 18" fill="none" stroke="currentColor" strokeWidth="5" />
      </svg>
      <span className="relative rounded-full bg-background/85 px-2 py-1">{initials(name)}</span>
    </div>
  );
}
