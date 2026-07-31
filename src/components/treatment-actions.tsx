import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, GitCompareArrows, Search } from "lucide-react";
import { type ComparisonFamilyRule, type TreatmentPickerRecord } from "@/lib/content-types";
import { comparisonSlugForPair, listCompatibleTreatmentOptions } from "@/lib/comparison-model";
import { trackEvent } from "@/lib/analytics";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TreatmentVisual } from "@/components/treatment-visual";

/** Open a focused picker containing only compatible comparison options. */
export function CompareWith({
  slug,
  name,
  treatments,
  familyRules,
}: {
  slug: string;
  name: string;
  treatments: TreatmentPickerRecord[];
  familyRules: ComparisonFamilyRule[];
}) {
  const [open, setOpen] = useState(false);
  const [other, setOther] = useState("");
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const selected = treatments.find((treatment) => treatment.slug === slug);
  const compatible = selected
    ? listCompatibleTreatmentOptions(selected, treatments, familyRules)
    : [];
  const options = compatible.filter(({ treatment }) => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return true;
    return [treatment.name, treatment.manufacturer, treatment.brand_name, treatment.category]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalized));
  });
  const selectedOption = compatible.find((option) => option.treatment.slug === other);
  const comparisonSlug =
    selected && selectedOption
      ? comparisonSlugForPair(selected, selectedOption.treatment, selectedOption.compatibility)
      : null;

  if (!selected || !compatible.length) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setQuery("");
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary bg-card px-5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <GitCompareArrows className="size-4" aria-hidden="true" />
          Compare
        </button>
      </DialogTrigger>

      <DialogContent className="bottom-0 left-0 top-auto h-[100dvh] max-w-none translate-x-0 translate-y-0 grid-rows-[auto_auto_auto_1fr_auto] gap-0 rounded-none p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(44rem,88vh)] sm:max-w-xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
        <DialogHeader className="border-b border-rule px-5 pb-4 pt-5 text-left">
          <DialogTitle>Compare {name}</DialogTitle>
          <DialogDescription>
            Choose one closely related product, device, or treatment approach.
          </DialogDescription>
        </DialogHeader>

        <div className="border-b border-rule bg-secondary/55 px-5 py-3">
          <div className="flex items-center gap-3 rounded-xl border-2 border-primary bg-card p-3">
            <TreatmentVisual name={selected.name} media={selected.media} className="size-14" />
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
                <Check className="size-3.5" aria-hidden="true" /> Selected
              </span>
              <p className="truncate font-medium">{selected.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {selected.manufacturer || selected.brand_name || selected.category}
              </p>
            </div>
          </div>
        </div>

        <label className="mx-5 my-4 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
          <Search aria-hidden="true" className="size-4 text-muted-foreground" />
          <span className="sr-only">Search compatible treatments</span>
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search compatible options"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <ul className="overflow-y-auto px-5 pb-4" role="listbox" aria-label="Compatible treatments">
          {options.map(({ treatment, section }, index) => {
            const active = other === treatment.slug;
            return (
              <li key={treatment.id}>
                {index === 0 || options[index - 1]?.section !== section ? (
                  <p className="sticky top-0 z-10 bg-background/95 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground backdrop-blur">
                    {section === "closest"
                      ? "Closest matches"
                      : section === "family"
                        ? "Other options in this family"
                        : "Different approaches"}
                  </p>
                ) : null}
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => setOther(treatment.slug)}
                  className={`flex w-full items-center gap-3 border-b border-rule py-3 text-left last:border-0 ${
                    active ? "text-primary" : ""
                  }`}
                >
                  <TreatmentVisual
                    name={treatment.name}
                    media={treatment.media}
                    className="size-12"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{treatment.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {treatment.manufacturer || treatment.brand_name || treatment.category}
                    </span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={`grid size-10 shrink-0 place-items-center rounded-full border ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-rule bg-card"
                    }`}
                  >
                    {active ? <Check className="size-4" /> : "+"}
                  </span>
                </button>
              </li>
            );
          })}
          {options.length === 0 ? (
            <li className="py-10 text-center text-sm text-muted-foreground">
              No compatible options match that search.
            </li>
          ) : null}
        </ul>

        <div className="sticky bottom-0 border-t border-rule bg-background p-4">
          <button
            type="button"
            disabled={!comparisonSlug}
            onClick={() => {
              if (!other || !comparisonSlug) return;
              trackEvent("compare_started", { from: slug, to: other });
              setOpen(false);
              navigate({ to: "/compare/$slug", params: { slug: comparisonSlug } });
            }}
            className="min-h-12 w-full rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
          >
            {selectedOption ? `Compare with ${selectedOption.treatment.name}` : "Choose one option"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
