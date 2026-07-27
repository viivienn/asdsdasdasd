import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Treatment } from "@/lib/content-types";
import { canonicalPairSlug } from "@/lib/content-types";

export function TreatmentPicker({
  treatments,
}: {
  treatments: Treatment[];
  publishedSlugs?: string[];
}) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const options = useMemo(
    () => [...treatments].sort((x, y) => x.name.localeCompare(y.name)),
    [treatments],
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        setMessage(null);
        if (!a || !b) return setMessage("Choose two treatments to compare.");
        if (a === b) return setMessage("Choose two different treatments.");
        navigate({ to: "/compare/$slug", params: { slug: canonicalPairSlug(a, b) } });
      }}
    >
      <div>
        <label htmlFor="tp-a" className="block text-sm font-medium">
          Treatment A
        </label>
        <select
          id="tp-a"
          value={a}
          onChange={(e) => setA(e.target.value)}
          className="mt-1 w-full border border-input bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary"
        >
          <option value="">Select a treatment</option>
          {options.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="tp-b" className="block text-sm font-medium">
          Treatment B
        </label>
        <select
          id="tp-b"
          value={b}
          onChange={(e) => setB(e.target.value)}
          className="mt-1 w-full border border-input bg-card px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-primary"
        >
          <option value="">Select a treatment</option>
          {options.map((t) => (
            <option key={t.id} value={t.slug}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <button
        type="submit"
        className="inline-flex h-[42px] items-center justify-center bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Compare treatments
      </button>
      {message ? (
        <p role="status" className="sm:col-span-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </form>
  );
}