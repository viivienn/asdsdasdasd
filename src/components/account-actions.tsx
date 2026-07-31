import { Bookmark, BookmarkCheck, Bell, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAccount } from "@/components/account-provider";
import {
  clearPendingAccountIntent,
  readPendingAccountIntent,
  type PendingAccountIntent,
} from "@/lib/account-flow";
import { trackEvent } from "@/lib/analytics";
import {
  createPriceSubscription,
  isComparisonSaved,
  isTreatmentSaved,
  removeSavedComparison,
  removeSavedTreatment,
  saveComparison,
  saveResearchPreference,
  saveTreatment,
} from "@/lib/research-client";

const actionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-rule bg-card px-5 text-sm font-medium transition-colors hover:border-primary disabled:opacity-60";

export function SaveTreatmentButton({
  treatmentId,
  treatmentName,
}: {
  treatmentId: string;
  treatmentName: string;
}) {
  const { user, loading, openAccountPrompt } = useAccount();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    void isTreatmentSaved(user.id, treatmentId)
      .then(setSaved)
      .catch(() => setSaved(false));
  }, [treatmentId, user]);

  useEffect(() => {
    function completed(event: Event) {
      const detail = (event as CustomEvent<PendingAccountIntent>).detail;
      if (detail.type === "save_treatment" && detail.treatmentId === treatmentId) {
        setSaved(true);
        setMessage(`${treatmentName} saved.`);
      }
    }
    window.addEventListener("aesthetic-index:pending-save-completed", completed);
    return () => window.removeEventListener("aesthetic-index:pending-save-completed", completed);
  }, [treatmentId, treatmentName]);

  async function toggle() {
    if (!user) {
      openAccountPrompt({
        source: "save_treatment",
        title: `Save ${treatmentName}`,
        body: "Create a free account to save this treatment and find it later in My Research.",
        intent: {
          type: "save_treatment",
          treatmentId,
          nextPath: window.location.pathname,
        },
      });
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (saved) {
        await removeSavedTreatment(user.id, treatmentId);
        setSaved(false);
        setMessage(`${treatmentName} removed from My Research.`);
      } else {
        await saveTreatment(user.id, treatmentId);
        setSaved(true);
        setMessage(`${treatmentName} saved.`);
        trackEvent("treatment_saved", { source: "save_treatment" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={toggle}
        disabled={loading || busy}
        aria-pressed={saved}
        className={actionClass}
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : saved ? (
          <BookmarkCheck className="size-4" aria-hidden="true" />
        ) : (
          <Bookmark className="size-4" aria-hidden="true" />
        )}
        {saved ? "Saved" : "Save treatment"}
      </button>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
    </span>
  );
}

export function SaveComparisonButton({
  treatmentAId,
  treatmentBId,
  label,
}: {
  treatmentAId: string;
  treatmentBId: string;
  label: string;
}) {
  const { user, loading, openAccountPrompt } = useAccount();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) {
      setSaved(false);
      return;
    }
    void isComparisonSaved(user.id, treatmentAId, treatmentBId)
      .then(setSaved)
      .catch(() => setSaved(false));
  }, [treatmentAId, treatmentBId, user]);

  useEffect(() => {
    function completed(event: Event) {
      const detail = (event as CustomEvent<PendingAccountIntent>).detail;
      if (
        detail.type === "save_comparison" &&
        [detail.treatmentAId, detail.treatmentBId].includes(treatmentAId) &&
        [detail.treatmentAId, detail.treatmentBId].includes(treatmentBId)
      ) {
        setSaved(true);
        setMessage(`${label} saved.`);
      }
    }
    window.addEventListener("aesthetic-index:pending-save-completed", completed);
    return () => window.removeEventListener("aesthetic-index:pending-save-completed", completed);
  }, [label, treatmentAId, treatmentBId]);

  async function toggle() {
    if (!user) {
      openAccountPrompt({
        source: "save_comparison",
        title: `Save ${label}`,
        body: "Create a free account to keep this comparison in My Research across devices.",
        intent: {
          type: "save_comparison",
          treatmentAId,
          treatmentBId,
          nextPath: window.location.pathname,
        },
      });
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      if (saved) {
        await removeSavedComparison(user.id, treatmentAId, treatmentBId);
        setSaved(false);
        setMessage(`${label} removed from My Research.`);
      } else {
        await saveComparison(user.id, treatmentAId, treatmentBId);
        setSaved(true);
        setMessage(`${label} saved.`);
        trackEvent("comparison_saved", { source: "save_comparison" });
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <span>
      <button
        type="button"
        onClick={toggle}
        disabled={loading || busy}
        aria-pressed={saved}
        className={actionClass}
      >
        {busy ? (
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        ) : saved ? (
          <BookmarkCheck className="size-4" aria-hidden="true" />
        ) : (
          <Bookmark className="size-4" aria-hidden="true" />
        )}
        {saved ? "Saved" : "Save comparison"}
      </button>
      <span className="sr-only" aria-live="polite">
        {message}
      </span>
    </span>
  );
}

export function AccountValueCard({ treatmentName }: { treatmentName?: string }) {
  const { user, loading, openAccountPrompt } = useAccount();
  if (loading || user) return null;
  const nextPath = typeof window === "undefined" ? "/" : window.location.pathname;

  return (
    <aside className="rounded-2xl border border-rule bg-muted/40 p-5">
      <h2 className="text-lg font-medium">Keep your research in one place</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Save this treatment, compare alternatives, and manage price updates.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() =>
            openAccountPrompt({
              source: "save_treatment",
              nextPath,
              title: treatmentName ? `Save research about ${treatmentName}` : undefined,
            })
          }
          className="min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground"
        >
          Create free account
        </button>
        <a
          href={`/auth?${new URLSearchParams({ next: nextPath, mode: "signin", source: "header" }).toString()}`}
          className={actionClass}
        >
          Sign in
        </a>
      </div>
    </aside>
  );
}

export function PriceUpdatesControl({
  treatmentId,
  comparisonGroupSlug,
  initialPostalCode = "",
}: {
  treatmentId?: string;
  comparisonGroupSlug?: string;
  initialPostalCode?: string;
}) {
  const { user, loading, openAccountPrompt } = useAccount();
  const [open, setOpen] = useState(false);
  const [postalCode, setPostalCode] = useState(initialPostalCode);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    const pending = readPendingAccountIntent();
    if (
      pending?.type === "price_update" &&
      (!pending.treatmentId || pending.treatmentId === treatmentId) &&
      (!pending.comparisonGroupSlug || pending.comparisonGroupSlug === comparisonGroupSlug)
    ) {
      setOpen(true);
    }
  }, [comparisonGroupSlug, treatmentId, user]);

  function begin() {
    if (!user) {
      openAccountPrompt({
        source: "price_update",
        title: "Manage price updates",
        body: "Create a free account to save your price region and manage treatment price updates.",
        intent: {
          type: "price_update",
          treatmentId,
          comparisonGroupSlug,
          nextPath: window.location.pathname,
        },
      });
      return;
    }
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true);
    setMessage("");
    try {
      await saveResearchPreference(user.id, postalCode, null);
      await createPriceSubscription({
        userId: user.id,
        treatmentId,
        comparisonGroupSlug,
        postalCode,
      });
      clearPendingAccountIntent();
      setMessage("Price updates saved. You can manage them in My Research.");
      trackEvent("price_subscription_created", { source: "price_update" });
    } catch {
      setMessage("We could not save that price update. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-rule bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
          <Bell className="size-4" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-lg font-medium">Get price updates</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Save a ZIP or postal region and manage updates from My Research.
          </p>
        </div>
      </div>

      {!open ? (
        <button
          type="button"
          onClick={begin}
          disabled={loading}
          className="mt-4 min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
        >
          Get price updates
        </button>
      ) : (
        <form onSubmit={submit} className="mt-4 flex max-w-lg flex-col gap-3 sm:flex-row">
          <label className="flex-1 text-sm font-medium">
            ZIP or postal code
            <input
              required
              value={postalCode}
              onChange={(event) => setPostalCode(event.target.value)}
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
            {busy ? "Saving..." : "Save updates"}
          </button>
        </form>
      )}
      {message ? (
        <p role="status" className="mt-3 text-sm text-muted-foreground">
          {message}
        </p>
      ) : null}
    </div>
  );
}
