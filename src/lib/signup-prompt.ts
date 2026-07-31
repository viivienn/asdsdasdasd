const VIEWS_KEY = "aesthetic-index:comparison-views";
const DISMISSED_KEY = "aesthetic-index:signup-prompt-dismissed";
const COMPLETE_KEY = "aesthetic-index:signup-prompt-complete";
const SESSION_SHOWN_KEY = "aesthetic-index:signup-prompt-shown";
const SESSION_ACTION_KEY = "aesthetic-index:account-modal-action";

export const SIGNUP_PROMPT_DISMISSAL_MS = 7 * 24 * 60 * 60 * 1000;

export function registerComparisonView(slug: string): string[] {
  if (typeof window === "undefined") return [];
  let views: string[] = [];
  try {
    const raw = localStorage.getItem(VIEWS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed))
      views = parsed.filter((item): item is string => typeof item === "string");
  } catch {
    views = [];
  }
  if (!views.includes(slug)) views.push(slug);
  localStorage.setItem(VIEWS_KEY, JSON.stringify(views.slice(-20)));
  return views;
}

export function markPromptDismissed(now = Date.now()) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DISMISSED_KEY, String(now));
  sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
}

export function markPromptCompleted() {
  if (typeof window === "undefined") return;
  localStorage.setItem(COMPLETE_KEY, "true");
  sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
}

export function markAccountModalOpenedByAction() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_ACTION_KEY, "true");
}

export function markPromptShown() {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_SHOWN_KEY, "true");
}

export function canShowSecondComparisonPrompt(distinctViews: string[], now = Date.now()): boolean {
  if (typeof window === "undefined" || distinctViews.length < 2) return false;
  if (sessionStorage.getItem(SESSION_SHOWN_KEY) === "true") return false;
  if (sessionStorage.getItem(SESSION_ACTION_KEY) === "true") return false;
  if (localStorage.getItem(COMPLETE_KEY) === "true") return false;
  const lastDismissed = Number(localStorage.getItem(DISMISSED_KEY) ?? 0);
  return !lastDismissed || now - lastDismissed >= SIGNUP_PROMPT_DISMISSAL_MS;
}
