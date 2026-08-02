import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FlaskConical, GitCompare, ScanLine, Search, Sparkles, Tag, X } from "lucide-react";
import {
  GROUP_LABEL,
  groupEntries,
  searchEntries,
  type SearchEntry,
  type SearchIndex,
  type SearchKind,
} from "@/lib/search-index";
import { TreatmentVisual } from "@/components/treatment-visual";

const KIND_ICON: Record<SearchKind, typeof Search> = {
  category: FlaskConical,
  treatment: Sparkles,
  brand: Tag,
  device: ScanLine,
  comparison: GitCompare,
};

function useEntryNavigate() {
  const navigate = useNavigate();
  return (entry: SearchEntry) => {
    if (entry.kind === "comparison") {
      navigate({ to: "/compare/$slug", params: { slug: entry.slug } });
    } else if (entry.kind === "treatment" || entry.kind === "brand" || entry.kind === "device") {
      navigate({ to: "/treatments/$slug", params: { slug: entry.slug } });
    } else {
      navigate({ to: "/explore", search: { type: entry.slug } });
    }
  };
}

function ResultRow({
  entry,
  active,
  query,
  onSelect,
  onHover,
}: {
  entry: SearchEntry;
  active: boolean;
  query?: string;
  onSelect: () => void;
  onHover: () => void;
}) {
  const Icon = KIND_ICON[entry.kind];
  const q = query?.trim().toLowerCase() ?? "";
  const at = q ? entry.label.toLowerCase().indexOf(q) : -1;

  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onHover}
        className={`flex w-full items-center gap-3 px-4 py-2.5 text-left ${
          active ? "bg-secondary" : ""
        }`}
      >
        {entry.entityType ? (
          <TreatmentVisual
            slug={entry.slug}
            name={entry.label}
            media={entry.media ?? null}
            className="size-10"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
          >
            <Icon className="size-4" />
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate text-[0.95rem] font-medium">
            {at >= 0 ? (
              <>
                {entry.label.slice(0, at)}
                <mark className="bg-transparent font-bold text-foreground">
                  {entry.label.slice(at, at + q.length)}
                </mark>
                {entry.label.slice(at + q.length)}
              </>
            ) : (
              entry.label
            )}
          </span>
          <span className="block truncate text-xs text-muted-foreground">{entry.sub}</span>
        </span>
      </button>
    </li>
  );
}

function GroupLabel({ children }: { children: string }) {
  return (
    <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
      {children}
    </p>
  );
}

export function SiteSearch({
  index,
  variant = "header",
}: {
  index: SearchIndex;
  variant?: "header" | "hero";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const go = useEntryNavigate();

  const results = searchEntries(index.entries, query);
  const groups = groupEntries(results);
  const showingResults = query.trim().length > 0;
  const flat: SearchEntry[] = showingResults
    ? groups.flatMap((g) => g.items)
    : [...index.categories, ...index.popular, ...index.featuredTreatments];

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function select(entry: SearchEntry) {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    go(entry);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(i + 1, flat.length - 1));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
      return;
    }
    if (event.key === "Enter" && flat[active]) {
      event.preventDefault();
      select(flat[active]);
    }
  }

  const hero = variant === "hero";
  const indexOf = (entry: SearchEntry) => flat.indexOf(entry);

  return (
    <div
      ref={containerRef}
      className={`relative ${hero ? "w-full" : "w-full max-w-sm xl:max-w-xs"}`}
    >
      <div
        className={`flex items-center gap-2.5 rounded-full border bg-card px-4 ${
          hero ? "h-14 text-base" : "h-10 text-sm"
        } ${open ? "border-primary ring-2 ring-primary/15" : "border-input"}`}
      >
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKeyDown}
          placeholder="Find treatments, products, brands or devices"
          aria-label="Search treatments, brands, categories and comparisons"
          className="w-full bg-transparent outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded border border-rule px-1.5 py-0.5 text-[0.65rem] text-muted-foreground sm:block">
            ⌘K
          </kbd>
        )}
      </div>

      {open ? (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-rule bg-popover py-1 shadow-lift">
          {showingResults ? (
            groups.length ? (
              groups.map((group) => (
                <div key={group.kind}>
                  <GroupLabel>{GROUP_LABEL[group.kind]}</GroupLabel>
                  <ul>
                    {group.items.map((entry) => (
                      <ResultRow
                        key={`${entry.kind}-${entry.slug}-${entry.label}`}
                        entry={entry}
                        query={query}
                        active={indexOf(entry) === active}
                        onSelect={() => select(entry)}
                        onHover={() => setActive(indexOf(entry))}
                      />
                    ))}
                  </ul>
                </div>
              ))
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No matches yet. Coverage is expanding — try “Botox”, “filler” or “Juvederm”.
              </p>
            )
          ) : (
            <>
              <GroupLabel>Browse by category</GroupLabel>
              <ul>
                {index.categories.map((entry) => (
                  <ResultRow
                    key={entry.slug}
                    entry={entry}
                    active={indexOf(entry) === active}
                    onSelect={() => select(entry)}
                    onHover={() => setActive(indexOf(entry))}
                  />
                ))}
              </ul>
              {index.popular.length ? (
                <>
                  <GroupLabel>Popular comparisons</GroupLabel>
                  <ul>
                    {index.popular.map((entry) => (
                      <ResultRow
                        key={entry.slug}
                        entry={entry}
                        active={indexOf(entry) === active}
                        onSelect={() => select(entry)}
                        onHover={() => setActive(indexOf(entry))}
                      />
                    ))}
                  </ul>
                </>
              ) : null}
              <GroupLabel>Explore treatments</GroupLabel>
              <ul>
                {index.featuredTreatments.map((entry) => (
                  <ResultRow
                    key={entry.slug}
                    entry={entry}
                    active={indexOf(entry) === active}
                    onSelect={() => select(entry)}
                    onHover={() => setActive(indexOf(entry))}
                  />
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
