import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import {
  POPULAR_SEARCHES,
  TRENDING_TREATMENTS,
  searchEntries,
  type SearchEntry,
} from "@/lib/search-index";

function useEntryNavigate() {
  const navigate = useNavigate();
  return (entry: SearchEntry) => {
    if (entry.kind === "comparison") {
      navigate({ to: "/compare/$slug", params: { slug: entry.slug } });
    } else if (entry.kind === "treatment") {
      navigate({ to: "/treatments/$slug", params: { slug: entry.slug } });
    } else {
      navigate({
        to: "/prices/us/ca/$city/$treatment",
        params: { city: "san-francisco", treatment: entry.slug },
      });
    }
  };
}

function ResultRow({
  entry,
  active,
  onSelect,
  onHover,
}: {
  entry: SearchEntry;
  active: boolean;
  onSelect: () => void;
  onHover: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        onMouseEnter={onHover}
        className={`flex w-full items-center gap-3 border-b border-rule px-4 py-3 text-left last:border-b-0 ${
          active ? "bg-secondary" : ""
        }`}
      >
        <Search aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0">
          <span className="block truncate text-[0.95rem]">{entry.label}</span>
          <span className="block truncate text-xs text-muted-foreground">{entry.sub}</span>
        </span>
      </button>
    </li>
  );
}

export function SiteSearch({ variant = "header" }: { variant?: "header" | "hero" }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const go = useEntryNavigate();

  const results = searchEntries(query);
  const showingResults = query.trim().length > 0;
  const flat: SearchEntry[] = showingResults
    ? results
    : [...POPULAR_SEARCHES, ...TRENDING_TREATMENTS.slice(0, 4)];

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

  return (
    <div ref={containerRef} className={`relative ${hero ? "w-full" : "w-full max-w-sm xl:max-w-xs"}`}>
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
          placeholder="Find treatments & comparisons"
          aria-label="Search treatments and comparisons"
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
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-rule bg-popover shadow-lift">
          {showingResults ? (
            results.length ? (
              <ul>
                {results.map((entry, i) => (
                  <ResultRow
                    key={`${entry.kind}-${entry.slug}-${entry.label}`}
                    entry={entry}
                    active={i === active}
                    onSelect={() => select(entry)}
                    onHover={() => setActive(i)}
                  />
                ))}
              </ul>
            ) : (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No matches yet. Coverage is expanding — try “Botox” or “Sculptra”.
              </p>
            )
          ) : (
            <>
              <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Popular comparisons
              </p>
              <ul>
                {POPULAR_SEARCHES.map((entry, i) => (
                  <ResultRow
                    key={entry.slug}
                    entry={entry}
                    active={i === active}
                    onSelect={() => select(entry)}
                    onHover={() => setActive(i)}
                  />
                ))}
              </ul>
              <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Trending treatments
              </p>
              <ul>
                {TRENDING_TREATMENTS.slice(0, 4).map((entry, i) => (
                  <ResultRow
                    key={entry.slug}
                    entry={entry}
                    active={POPULAR_SEARCHES.length + i === active}
                    onSelect={() => select(entry)}
                    onHover={() => setActive(POPULAR_SEARCHES.length + i)}
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