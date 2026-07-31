import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Check, Plus, Search, X } from "lucide-react";
import {
  ENTITY_LABEL,
  type ComparisonFamilyRule,
  type TreatmentPickerRecord,
} from "@/lib/content-types";
import {
  addPickerSelection,
  comparisonSlugForPair,
  displayValue,
  hasMinimumComparisonProfile,
  listCompatibleTreatmentOptions,
  nextPickerIndex,
  resolvePairCompatibility,
} from "@/lib/comparison-model";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TreatmentVisual } from "@/components/treatment-visual";

export function TreatmentPicker({
  treatments,
  familyRules,
}: {
  treatments: TreatmentPickerRecord[];
  familyRules: ComparisonFamilyRule[];
}) {
  const [selected, setSelected] = useState<TreatmentPickerRecord[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const navigate = useNavigate();

  const compatibleOptions = useMemo(
    () =>
      selected.length === 1
        ? listCompatibleTreatmentOptions(selected[0], treatments, familyRules)
        : [],
    [familyRules, selected, treatments],
  );

  const options = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const candidates =
      selected.length === 1
        ? compatibleOptions
        : treatments
            .filter(
              (treatment) =>
                hasMinimumComparisonProfile(treatment) &&
                listCompatibleTreatmentOptions(treatment, treatments, familyRules).length > 0,
            )
            .map((treatment) => ({
              treatment,
              section: "closest" as const,
              compatibility: {
                mode: "direct" as const,
                templateKey: "",
                publicLabel: "",
              },
            }));

    return candidates
      .filter(({ treatment }) => !selected.some((item) => item.id === treatment.id))
      .filter(
        ({ treatment }) =>
          !normalizedQuery ||
          [
            treatment.name,
            treatment.manufacturer,
            treatment.brand_name,
            treatment.category,
            treatment.treatment_class,
          ]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(normalizedQuery)),
      );
  }, [compatibleOptions, familyRules, query, selected, treatments]);

  const selectedCompatibility =
    selected.length === 2 ? resolvePairCompatibility(selected[0], selected[1], familyRules) : null;
  const comparisonSlug =
    selected.length === 2 && selectedCompatibility
      ? comparisonSlugForPair(selected[0], selected[1], selectedCompatibility)
      : undefined;

  useEffect(() => {
    setActiveIndex(options.length ? 0 : -1);
    optionRefs.current = [];
  }, [options.length, query, selected.length]);

  function remove(treatmentId: string) {
    setSelected((items) => items.filter((item) => item.id !== treatmentId).slice(0, 1));
    setQuery("");
  }

  function add(treatment: TreatmentPickerRecord) {
    setSelected((items) => addPickerSelection(items, treatment));
    setQuery("");
  }

  function compare() {
    if (selected.length !== 2 || !comparisonSlug) return;
    setOpen(false);
    navigate({ to: "/compare/$slug", params: { slug: comparisonSlug } });
  }

  function onOptionsKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = nextPickerIndex(
      activeIndex,
      event.key as "ArrowDown" | "ArrowUp" | "Home" | "End",
      options.length,
    );
    setActiveIndex(next);
    optionRefs.current[next]?.focus();
  }

  return (
    <div>
      {selected.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {selected.map((treatment) => (
            <SelectedTreatment
              key={treatment.id}
              treatment={treatment}
              onRemove={() => remove(treatment.id)}
            />
          ))}
        </div>
      ) : null}

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
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary px-4 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5"
          >
            <Plus aria-hidden="true" className="size-4" />
            {selected.length === 0
              ? "Choose a treatment"
              : selected.length === 1
                ? "Add a treatment to compare"
                : "Change comparison"}
          </button>
        </DialogTrigger>
        <DialogContent className="bottom-0 left-0 top-auto h-[100dvh] max-w-none translate-x-0 translate-y-0 grid-rows-[auto_auto_auto_1fr_auto] gap-0 rounded-none p-0 sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:h-[min(46rem,88vh)] sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl">
          <DialogHeader className="border-b border-rule px-5 pb-4 pt-5 text-left">
            <DialogTitle>
              {selected.length === 0 ? "Choose a treatment" : "Build your comparison"}
            </DialogTitle>
            <DialogDescription aria-live="polite">
              {selected.length === 0
                ? "Start with a published treatment profile."
                : selected.length === 1
                  ? `Closest matches and other options in the same treatment family as ${selected[0].name}.`
                  : "Two treatments selected."}
            </DialogDescription>
          </DialogHeader>

          {selected.length ? (
            <div className="grid gap-2 border-b border-rule bg-muted/45 px-5 py-3 sm:grid-cols-2">
              {selected.map((treatment) => (
                <SelectedTreatment
                  key={treatment.id}
                  treatment={treatment}
                  compact
                  onRemove={() => remove(treatment.id)}
                />
              ))}
            </div>
          ) : null}

          {selected.length < 2 ? (
            <label className="mx-5 my-4 flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
              <Search aria-hidden="true" className="size-4 text-muted-foreground" />
              <span className="sr-only">Search treatments</span>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search name, family or manufacturer"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
          ) : (
            <div className="h-4" />
          )}

          <ul
            className="overflow-y-auto px-5 pb-4"
            role="listbox"
            aria-label="Available treatments"
            onKeyDown={onOptionsKeyDown}
          >
            {selected.length < 2
              ? options.map(({ treatment, section }, index) => (
                  <Fragment key={treatment.id}>
                    {selected.length === 1 &&
                    (index === 0 || options[index - 1]?.section !== section) ? (
                      <li
                        role="presentation"
                        className="sticky top-0 z-10 -mx-1 bg-background/95 px-1 pb-1 pt-4 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground backdrop-blur"
                      >
                        {section === "closest" ? "Closest matches" : "Other options in this family"}
                      </li>
                    ) : null}
                    <li className="flex items-center gap-3 border-b border-rule py-3 last:border-0">
                      <TreatmentVisual name={treatment.name} media={treatment.media} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{treatment.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {treatment.manufacturer || treatment.brand_name || treatment.category}
                        </p>
                        <p className="mt-0.5 text-xs">{ENTITY_LABEL[treatment.entity_type]}</p>
                        {treatment.intended_areas.length ? (
                          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                            {displayValue(treatment, "intended_areas")}
                          </p>
                        ) : null}
                      </div>
                      <button
                        ref={(node) => {
                          optionRefs.current[index] = node;
                        }}
                        type="button"
                        role="option"
                        aria-selected={activeIndex === index}
                        onFocus={() => setActiveIndex(index)}
                        onClick={() => add(treatment)}
                        className="min-h-11 rounded-full border border-primary px-4 text-xs font-medium text-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                      >
                        Add
                      </button>
                    </li>
                  </Fragment>
                ))
              : null}
            {selected.length < 2 && options.length === 0 ? (
              <li className="py-10 text-center text-sm text-muted-foreground">
                No compatible published treatments match this search.
              </li>
            ) : null}
          </ul>

          <div className="sticky bottom-0 border-t border-rule bg-background p-4">
            <button
              type="button"
              disabled={selected.length !== 2 || !comparisonSlug}
              onClick={compare}
              className="min-h-12 w-full rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
            >
              {selected.length === 2 ? "Compare treatments" : `Select ${2 - selected.length} more`}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <button
        type="button"
        disabled={selected.length !== 2 || !comparisonSlug}
        onClick={compare}
        className="mt-3 min-h-12 w-full rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
      >
        Compare treatments
      </button>
    </div>
  );
}

function SelectedTreatment({
  treatment,
  onRemove,
  compact = false,
}: {
  treatment: TreatmentPickerRecord;
  onRemove: () => void;
  compact?: boolean;
}) {
  return (
    <article
      className={`relative flex items-center gap-3 rounded-xl border-2 border-primary bg-primary/5 ${
        compact ? "p-2.5" : "p-3"
      }`}
    >
      <TreatmentVisual
        name={treatment.name}
        media={treatment.media}
        className={compact ? "size-12" : "size-16"}
      />
      <div className="min-w-0 pr-7">
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          <Check aria-hidden="true" className="size-3.5" />
          Selected
        </span>
        <h3 className="truncate font-medium">{treatment.name}</h3>
        <p className="truncate text-xs text-muted-foreground">
          {treatment.manufacturer || treatment.brand_name || treatment.category}
        </p>
      </div>
      <button
        type="button"
        aria-label={`Remove ${treatment.name}`}
        onClick={onRemove}
        className="absolute right-2 top-2 grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <X aria-hidden="true" className="size-4" />
      </button>
    </article>
  );
}
