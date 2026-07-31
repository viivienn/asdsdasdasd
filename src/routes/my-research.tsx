import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark, GitCompareArrows, MapPin, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "@/components/account-provider";
import { trackEvent } from "@/lib/analytics";
import {
  loadResearchLibrary,
  removePriceSubscription,
  removeSavedComparison,
  removeSavedTreatment,
  saveResearchPreference,
  type PriceSubscriptionView,
  type SavedComparisonView,
  type SavedTreatmentView,
} from "@/lib/research-client";

type ResearchData = {
  savedTreatments: SavedTreatmentView[];
  savedComparisons: SavedComparisonView[];
  preference: { postal_code: string | null; region_slug: string | null } | null;
  subscriptions: PriceSubscriptionView[];
};

export const Route = createFileRoute("/my-research")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "My Research | Aesthetic Index" },
      {
        name: "description",
        content: "Manage your saved treatments, comparisons, price region, and price updates.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: MyResearchPage,
});

function MyResearchPage() {
  const { user, loading } = useAccount();
  const [data, setData] = useState<ResearchData | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user) return;
    setError("");
    try {
      setData(await loadResearchLibrary(user.id));
    } catch {
      setError("We could not load your saved research. Please refresh and try again.");
    }
  }, [user]);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.replace("/auth?next=%2Fmy-research&mode=signin&source=header");
      return;
    }
    trackEvent("my_research_viewed", { source: "header" });
    void refresh();
  }, [loading, refresh, user]);

  if (loading || (!user && !error)) {
    return <p className="text-sm text-muted-foreground">Loading your research...</p>;
  }
  if (error) {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    );
  }
  if (!user || !data) {
    return <p className="text-sm text-muted-foreground">Loading your research...</p>;
  }

  return (
    <>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Account</p>
        <h1 className="mt-1 font-display text-4xl">My Research</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Your saved treatments, comparisons, and regional price updates in one private place.
        </p>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <ResearchSection
          icon={<Bookmark className="size-5" aria-hidden="true" />}
          title="Saved treatments"
          empty={
            <>
              No saved treatments yet.{" "}
              <Link to="/explore" search={{}} className="underline underline-offset-4">
                Explore treatments
              </Link>
              .
            </>
          }
          hasItems={data.savedTreatments.length > 0}
        >
          <ul className="divide-y divide-rule">
            {data.savedTreatments.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <Link
                    to="/treatments/$slug"
                    params={{ slug: item.treatment.slug }}
                    className="font-medium hover:underline"
                  >
                    {item.treatment.name}
                  </Link>
                  {item.treatment.summary ? (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {item.treatment.summary}
                    </p>
                  ) : null}
                </div>
                <RemoveButton
                  label={`Remove ${item.treatment.name}`}
                  onRemove={async () => {
                    await removeSavedTreatment(user.id, item.treatment.id);
                    await refresh();
                  }}
                />
              </li>
            ))}
          </ul>
        </ResearchSection>

        <ResearchSection
          icon={<GitCompareArrows className="size-5" aria-hidden="true" />}
          title="Saved comparisons"
          empty={
            <>
              No saved comparisons yet.{" "}
              <Link to="/compare" className="underline underline-offset-4">
                Compare treatments
              </Link>
              .
            </>
          }
          hasItems={data.savedComparisons.length > 0}
        >
          <ul className="divide-y divide-rule">
            {data.savedComparisons.map((item) => {
              const slug =
                item.slug ??
                [item.treatmentA.slug, item.treatmentB.slug]
                  .map((value) => (value === "ha-filler" ? "dermal-fillers" : value))
                  .sort()
                  .join("-vs-");
              const label = `${item.treatmentA.name} vs. ${item.treatmentB.name}`;
              return (
                <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                  <Link
                    to="/compare/$slug"
                    params={{ slug }}
                    className="font-medium hover:underline"
                  >
                    {label}
                  </Link>
                  <RemoveButton
                    label={`Remove ${label}`}
                    onRemove={async () => {
                      await removeSavedComparison(user.id, item.treatmentA.id, item.treatmentB.id);
                      await refresh();
                    }}
                  />
                </li>
              );
            })}
          </ul>
        </ResearchSection>

        <PriceRegion
          postalCode={data.preference?.postal_code ?? ""}
          onSave={async (postalCode) => {
            await saveResearchPreference(user.id, postalCode, data.preference?.region_slug ?? null);
            await refresh();
          }}
        />

        <ResearchSection
          icon={<MapPin className="size-5" aria-hidden="true" />}
          title="Price update subscriptions"
          empty="No price update subscriptions yet. Use Get price updates on a public price or treatment page."
          hasItems={data.subscriptions.length > 0}
        >
          <ul className="divide-y divide-rule">
            {data.subscriptions.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div>
                  <p className="font-medium">
                    {item.treatment?.name ??
                      item.comparisonGroupSlug?.replace(/-/g, " ") ??
                      "Treatment prices"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.postalCode || item.regionSlug || "Saved region"}
                  </p>
                </div>
                <RemoveButton
                  label="Remove price update"
                  onRemove={async () => {
                    await removePriceSubscription(user.id, item.id);
                    await refresh();
                  }}
                />
              </li>
            ))}
          </ul>
        </ResearchSection>
      </div>
    </>
  );
}

function ResearchSection({
  icon,
  title,
  empty,
  hasItems,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  empty: React.ReactNode;
  hasItems: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-rule bg-card p-5">
      <h2 className="flex items-center gap-2 text-xl">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      {hasItems ? (
        <div className="mt-3">{children}</div>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{empty}</p>
      )}
    </section>
  );
}

function PriceRegion({
  postalCode,
  onSave,
}: {
  postalCode: string;
  onSave: (postalCode: string) => Promise<void>;
}) {
  const [value, setValue] = useState(postalCode);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => setValue(postalCode), [postalCode]);

  return (
    <section className="rounded-2xl border border-rule bg-card p-5">
      <h2 className="flex items-center gap-2 text-xl">
        <MapPin className="size-5 text-primary" aria-hidden="true" />
        Price region
      </h2>
      <form
        className="mt-4 flex flex-col gap-3 sm:flex-row"
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setMessage("");
          try {
            await onSave(value);
            setMessage("Price region saved.");
          } catch {
            setMessage("We could not save that region.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="flex-1 text-sm font-medium">
          ZIP or postal code
          <input
            value={value}
            onChange={(event) => setValue(event.target.value)}
            minLength={3}
            maxLength={12}
            autoComplete="postal-code"
            className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="min-h-11 self-end rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Saving..." : "Save region"}
        </button>
      </form>
      {message ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </section>
  );
}

function RemoveButton({ label, onRemove }: { label: string; onRemove: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          await onRemove();
        } finally {
          setBusy(false);
        }
      }}
      className="grid size-10 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
    >
      <Trash2 className="size-4" aria-hidden="true" />
    </button>
  );
}
