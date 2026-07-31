import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { canonicalPair, safeNextPath } from "./account-flow.ts";
import {
  SIGNUP_PROMPT_DISMISSAL_MS,
  canShowSecondComparisonPrompt,
  markAccountModalOpenedByAction,
  markPromptCompleted,
  markPromptDismissed,
  registerComparisonView,
} from "./signup-prompt.ts";

const root = new URL("../", import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), "utf8");

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) {
    return this.values.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
  removeItem(key: string) {
    this.values.delete(key);
  }
  clear() {
    this.values.clear();
  }
}

const local = new MemoryStorage();
const session = new MemoryStorage();
Object.assign(globalThis, {
  window: {},
  localStorage: local,
  sessionStorage: session,
});

function resetStorage() {
  local.clear();
  session.clear();
}

test("safe next-route handling accepts local routes and rejects external redirects", () => {
  assert.equal(safeNextPath("/my-research"), "/my-research");
  assert.equal(
    safeNextPath("/compare/botox-vs-dysport?from=save#results"),
    "/compare/botox-vs-dysport?from=save#results",
  );
  assert.equal(safeNextPath("//evil.example/path"), "/");
  assert.equal(safeNextPath("https://evil.example/path"), "/");
  assert.equal(safeNextPath(undefined), "/");
});

test("canonical saved comparison key is identical when the pair is reversed", () => {
  const forward = canonicalPair(
    "00000000-0000-0000-0000-000000000001",
    "00000000-0000-0000-0000-000000000002",
  );
  const reversed = canonicalPair(
    "00000000-0000-0000-0000-000000000002",
    "00000000-0000-0000-0000-000000000001",
  );
  assert.deepEqual(forward, reversed);
});

test("first comparison does not qualify, second distinct comparison does", () => {
  resetStorage();
  const first = registerComparisonView("botox-vs-dysport");
  assert.equal(canShowSecondComparisonPrompt(first, 1_000), false);
  const repeated = registerComparisonView("botox-vs-dysport");
  assert.equal(canShowSecondComparisonPrompt(repeated, 1_000), false);
  const second = registerComparisonView("sculptra-vs-radiesse");
  assert.equal(canShowSecondComparisonPrompt(second, 1_000), true);
});

test("dismissal suppresses the prompt for seven days", () => {
  resetStorage();
  const views = ["botox-vs-dysport", "sculptra-vs-radiesse"];
  markPromptDismissed(10_000);
  session.clear();
  assert.equal(
    canShowSecondComparisonPrompt(views, 10_000 + SIGNUP_PROMPT_DISMISSAL_MS - 1),
    false,
  );
  assert.equal(canShowSecondComparisonPrompt(views, 10_000 + SIGNUP_PROMPT_DISMISSAL_MS), true);
});

test("completed prompts and save-action prompts suppress automatic acquisition", () => {
  resetStorage();
  const views = ["botox-vs-dysport", "sculptra-vs-radiesse"];
  markPromptCompleted();
  session.clear();
  assert.equal(canShowSecondComparisonPrompt(views), false);

  resetStorage();
  markAccountModalOpenedByAction();
  assert.equal(canShowSecondComparisonPrompt(views), false);
});

test("public comparison remains readable and indexability is not auth-dependent", () => {
  const route = read("routes/compare.$slug.tsx");
  assert.match(route, /ComparisonGlance/);
  assert.match(route, /ComparisonDetails/);
  assert.match(route, /isAccessibleForFree:\s*true/);
  assert.doesNotMatch(route, /redirect\(\{\s*to:\s*"\/auth"/);
  assert.match(route, /SaveComparisonButton/);
});

test("anonymous save actions open the real account flow while signed-in saves use RLS-backed tables", () => {
  const actions = read("components/account-actions.tsx");
  const provider = read("components/account-provider.tsx");
  const research = read("lib/research-client.ts");
  assert.match(actions, /source:\s*"save_treatment"/);
  assert.match(actions, /source:\s*"save_comparison"/);
  assert.match(provider, /signInWithOAuth\("google"/);
  assert.match(research, /\.from\("saved_treatments"\)/);
  assert.match(research, /\.from\("saved_comparisons"\)/);
  assert.match(research, /\.eq\("user_id", userId\)/);
});

test("account tables are private by default and each CRUD policy is scoped to the owner", () => {
  const migration = read("../supabase/migrations/20260730030000_unified_free_account.sql");
  for (const table of [
    "saved_treatments",
    "saved_comparisons",
    "user_research_preferences",
    "price_update_subscriptions",
  ]) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, "i"),
    );
    assert.doesNotMatch(migration, new RegExp(`grant .* on public\\.${table} to anon`, "i"));
  }
  for (const operation of ["select", "insert", "update", "delete"]) {
    assert.match(migration, new RegExp(`for ${operation} to authenticated`, "i"));
  }
  assert.match(migration, /user_id = auth\.uid\(\)/);
  assert.match(migration, /private\.has_role\(auth\.uid\(\), 'admin'/);
});

test("My Research redirects anonymous visitors and account-only pages are noindex", () => {
  const auth = read("routes/auth.tsx");
  const research = read("routes/my-research.tsx");
  const sitemap = read("routes/sitemap[.]xml.ts");
  assert.match(research, /window\.location\.replace\("\/auth\?next=%2Fmy-research/);
  assert.match(research, /noindex, nofollow/);
  assert.match(auth, /noindex, nofollow/);
  assert.doesNotMatch(sitemap, /path:\s*"\/auth"/);
  assert.doesNotMatch(sitemap, /path:\s*"\/my-research"/);
});

test("fake MatchGate and competing scroll prompt behavior are removed", () => {
  const treatmentRoute = read("routes/treatments.$slug.tsx");
  const treatmentActions = read("components/treatment-actions.tsx");
  assert.doesNotMatch(treatmentRoute, /MatchGate/);
  assert.doesNotMatch(treatmentActions, /match_gate_signup|match_gate_opened/);
  assert.match(treatmentRoute, /AccountValueCard/);
  assert.throws(() => read("components/scroll-capture.tsx"));
});

test("signed-in users never receive the second-comparison acquisition modal", () => {
  const prompt = read("components/comparison-signup-prompt.tsx");
  assert.match(
    prompt,
    /if \(loading \|\| user \|\| !eligible\.current \|\| opened\.current\) return/,
  );
});
