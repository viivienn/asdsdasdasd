import * as Dialog from "@radix-ui/react-dialog";
import { Link } from "@tanstack/react-router";
import { Bookmark, FolderHeart, MapPin, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import {
  clearPendingAccountIntent,
  readPendingAccountIntent,
  safeNextPath,
  SIGNUP_SOURCE_KEY,
  writePendingAccountIntent,
  type PendingAccountIntent,
  type SignupTrigger,
} from "@/lib/account-flow";
import { trackEvent } from "@/lib/analytics";
import { completePendingSave } from "@/lib/research-client";
import {
  markAccountModalOpenedByAction,
  markPromptCompleted,
  markPromptDismissed,
} from "@/lib/signup-prompt";

type AccountPromptOptions = {
  source: SignupTrigger;
  nextPath?: string;
  intent?: PendingAccountIntent;
  title?: string;
  body?: string;
};

type AccountContextValue = {
  user: User | null;
  loading: boolean;
  openAccountPrompt: (options: AccountPromptOptions) => void;
  signOut: () => Promise<void>;
};

const AccountContext = createContext<AccountContextValue | null>(null);

export function useAccount() {
  const context = useContext(AccountContext);
  if (!context) throw new Error("useAccount must be used inside AccountProvider");
  return context;
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState<AccountPromptOptions | null>(null);
  const completingUser = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      completingUser.current = null;
      return;
    }
    if (completingUser.current === user.id) return;
    completingUser.current = user.id;
    markPromptCompleted();

    const source = localStorage.getItem(SIGNUP_SOURCE_KEY) as SignupTrigger | null;
    if (source) {
      trackEvent("signup_completed", { source });
      localStorage.removeItem(SIGNUP_SOURCE_KEY);
    }

    const intent = readPendingAccountIntent();
    if (!intent || intent.type === "price_update") return;
    void completePendingSave(user.id, intent)
      .then(() => {
        clearPendingAccountIntent();
        trackEvent(intent.type === "save_treatment" ? "treatment_saved" : "comparison_saved", {
          source: intent.type,
        });
        window.dispatchEvent(
          new CustomEvent("aesthetic-index:pending-save-completed", { detail: intent }),
        );
      })
      .catch(() => {
        completingUser.current = null;
      });
  }, [user]);

  const openAccountPrompt = useCallback((options: AccountPromptOptions) => {
    const nextPath = safeNextPath(
      options.nextPath ?? (typeof window === "undefined" ? "/" : window.location.pathname),
    );
    const normalized = { ...options, nextPath };
    if (options.intent) writePendingAccountIntent({ ...options.intent, nextPath });
    if (options.source !== "second_comparison") markAccountModalOpenedByAction();
    trackEvent("signup_prompt_impression", { source: options.source });
    setPrompt(normalized);
  }, []);

  const value = useMemo<AccountContextValue>(
    () => ({
      user,
      loading,
      openAccountPrompt,
      signOut: async () => {
        await supabase.auth.signOut();
        completingUser.current = null;
        setUser(null);
      },
    }),
    [loading, openAccountPrompt, user],
  );

  return (
    <AccountContext.Provider value={value}>
      {children}
      <AccountModal prompt={prompt} onClose={() => setPrompt(null)} />
    </AccountContext.Provider>
  );
}

function AccountModal({
  prompt,
  onClose,
}: {
  prompt: AccountPromptOptions | null;
  onClose: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const nextPath = safeNextPath(prompt?.nextPath);
  const source = prompt?.source ?? "header";

  function started() {
    localStorage.setItem(SIGNUP_SOURCE_KEY, source);
    trackEvent("signup_started", { source });
  }

  function goToEmail(mode: "signin" | "signup") {
    started();
    const search = new URLSearchParams({ next: nextPath, mode, source });
    window.location.href = `/auth?${search.toString()}`;
  }

  async function continueWithGoogle() {
    setBusy(true);
    setError("");
    started();
    const redirect = `${window.location.origin}/auth?${new URLSearchParams({
      next: nextPath,
      source,
    }).toString()}`;
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirect });
    if (result.error) {
      setError(result.error.message);
      setBusy(false);
      return;
    }
    if (!result.redirected) window.location.href = nextPath;
  }

  function dismiss() {
    if (source === "second_comparison") {
      markPromptDismissed();
    }
    trackEvent("signup_prompt_dismissed", { source });
    onClose();
  }

  return (
    <Dialog.Root open={Boolean(prompt)} onOpenChange={(open) => !open && dismiss()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-foreground/35 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed inset-x-0 bottom-0 z-[81] max-h-[92dvh] overflow-y-auto rounded-t-3xl border border-rule bg-background shadow-lift focus:outline-none sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[min(58rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-3xl">
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full border border-rule bg-background hover:bg-secondary"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
          <div className="grid md:grid-cols-[1fr_0.9fr]">
            <div className="p-6 sm:p-9">
              <Dialog.Title className="pr-10 font-display text-3xl">
                {prompt?.title ?? "Keep your research in one place"}
              </Dialog.Title>
              <Dialog.Description className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                {prompt?.body ??
                  "Save comparisons, build a treatment shortlist, and manage price updates near you."}
              </Dialog.Description>

              <div className="mt-7 grid gap-3">
                <button
                  type="button"
                  onClick={continueWithGoogle}
                  disabled={busy}
                  className="min-h-11 rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  Continue with Google
                </button>
                <button
                  type="button"
                  onClick={() => goToEmail("signup")}
                  disabled={busy}
                  className="min-h-11 rounded-full border border-rule bg-card px-5 text-sm font-medium hover:border-primary disabled:opacity-60"
                >
                  Continue with email
                </button>
                {error ? (
                  <p role="alert" className="text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={dismiss}
                className="mt-5 text-sm text-muted-foreground underline underline-offset-4"
              >
                Not now
              </button>
              <p className="mt-5 text-sm text-muted-foreground">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => goToEmail("signin")}
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Sign in
                </button>
              </p>
            </div>

            <div className="hidden border-l border-rule bg-muted/45 p-9 md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                My Research
              </p>
              <div className="mt-5 space-y-3">
                <PreviewRow
                  icon={<Bookmark className="size-4" />}
                  title="Saved treatments"
                  detail="Keep a shortlist of treatment profiles."
                />
                <PreviewRow
                  icon={<FolderHeart className="size-4" />}
                  title="Saved comparisons"
                  detail="Return to the decisions you are researching."
                />
                <PreviewRow
                  icon={<MapPin className="size-4" />}
                  title="Regional price updates"
                  detail="Manage one saved price region."
                />
              </div>
              <p className="mt-7 text-xs leading-5 text-muted-foreground">
                Creating an account does not unlock medical advice or change the public information
                on this page.
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function PreviewRow({ icon, title, detail }: { icon: ReactNode; title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-rule bg-card p-4">
      <div className="flex items-center gap-2 font-medium">
        <span className="text-primary" aria-hidden="true">
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{detail}</p>
    </div>
  );
}

export function HeaderAccountControl({ mobile = false }: { mobile?: boolean }) {
  const { user, loading, openAccountPrompt, signOut } = useAccount();
  if (loading) return <span className={mobile ? "h-11" : "w-14"} aria-hidden="true" />;

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => openAccountPrompt({ source: "header" })}
        className={
          mobile
            ? "rounded-xl border border-rule bg-card px-4 py-3 text-left text-sm font-medium"
            : "rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary"
        }
      >
        Sign in
      </button>
    );
  }

  return (
    <div className={mobile ? "grid gap-2" : "flex items-center gap-1"}>
      <Link
        to="/my-research"
        className={
          mobile
            ? "rounded-xl border border-rule bg-card px-4 py-3 text-sm font-medium"
            : "rounded-full px-3 py-2 text-sm transition-colors hover:bg-secondary"
        }
      >
        My Research
      </Link>
      <button
        type="button"
        onClick={() => void signOut()}
        className={
          mobile
            ? "rounded-xl px-4 py-3 text-left text-sm text-muted-foreground"
            : "rounded-full px-3 py-2 text-sm text-muted-foreground hover:bg-secondary"
        }
      >
        Sign out
      </button>
    </div>
  );
}
