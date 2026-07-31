import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { safeNextPath, SIGNUP_SOURCE_KEY, type SignupTrigger } from "@/lib/account-flow";
import { trackEvent } from "@/lib/analytics";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => {
    const search: {
      next?: string;
      mode?: "signin" | "signup";
      source?: string;
    } = {};
    if (typeof s.next === "string") search.next = s.next;
    if (s.mode === "signup" || s.mode === "signin") search.mode = s.mode;
    if (typeof s.source === "string") search.source = s.source;
    return search;
  },
  head: () => ({
    meta: [
      { title: "Sign in — Aesthetic Index" },
      {
        name: "description",
        content:
          "Create an account to save treatments and comparisons, organize your research, and manage regional price updates.",
      },
      { property: "og:title", content: "Sign in — Aesthetic Index" },
      {
        property: "og:description",
        content:
          "Create an account to save treatments and comparisons, organize research, and manage price updates.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next, mode: initialMode, source: rawSource } = Route.useSearch();
  const target = safeNextPath(next);
  const source = (rawSource ?? "header") as SignupTrigger;
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      window.location.replace(target);
    });
  }, [source, target]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    localStorage.setItem(SIGNUP_SOURCE_KEY, source);
    trackEvent("signup_started", { source });
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) return setError(error.message);
      window.location.href = target;
      return;
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}${target}` },
    });
    setBusy(false);
    if (error) return setError(error.message);
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      window.location.href = target;
    } else setNotice("Check your inbox to confirm your email, then come back to this link.");
  }

  async function google() {
    setBusy(true);
    setError(null);
    localStorage.setItem(SIGNUP_SOURCE_KEY, source);
    trackEvent("signup_started", { source });
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?${new URLSearchParams({
        next: target,
        source,
      }).toString()}`,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message);
      return;
    }
    if (result.redirected) return;
    window.location.href = target;
  }

  return (
    <>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create an account to save treatments and comparisons, organize your research, and manage
          regional price updates.
        </p>

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="mt-6 w-full rounded-full border border-rule px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary disabled:opacity-60"
        >
          Continue with Google
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-rule" />
          or
          <span className="h-px flex-1 bg-rule" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rule bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-rule bg-background px-3 py-2 text-sm"
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {notice ? (
            <p aria-live="polite" className="text-sm text-muted-foreground">
              {notice}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setNotice(null);
          }}
          className="mt-4 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>
      </div>
    </>
  );
}
