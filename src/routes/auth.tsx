import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { SiteShell } from "@/components/site-shell";

function safeNext(next: string | undefined): string {
  if (!next) return "/";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Aesthetic Index" },
      {
        name: "description",
        content:
          "Sign in to Aesthetic Index to connect assistants and manage your saved treatment comparisons.",
      },
      { property: "og:title", content: "Sign in — Aesthetic Index" },
      {
        property: "og:description",
        content: "Sign in to Aesthetic Index to connect assistants and manage saved comparisons.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const target = safeNext(next);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
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
    if (data.session) window.location.href = target;
    else setNotice("Check your inbox to confirm your email, then come back to this link.");
    void navigate;
  }

  async function google() {
    setBusy(true);
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?next=${encodeURIComponent(target)}`,
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
    <SiteShell>
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Sign in" : "Create an account"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accounts are used to connect assistants and tools to Aesthetic Index.
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
    </SiteShell>
  );
}