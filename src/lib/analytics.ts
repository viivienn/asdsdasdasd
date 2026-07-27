/**
 * Minimal, dependency-free analytics event bus.
 *
 * Events are forwarded to whichever analytics tag is present at runtime
 * (Lovable analytics, GA/GTM, or Plausible) and always re-dispatched as a
 * DOM CustomEvent so anything else on the page can observe them. No personal
 * data is ever included — only coarse, non-identifying properties.
 */
export type AnalyticsEvent =
  | "scroll_prompt_impression"
  | "scroll_prompt_step_completed"
  | "scroll_prompt_submitted"
  | "price_alert_submitted"
  | "alert_signup_success"
  | "answer_engine_referral";

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

type WindowWithTags = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  plausible?: (name: string, opts?: { props?: AnalyticsProps }) => void;
};

export function trackEvent(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  if (typeof window === "undefined") return;
  const w = window as WindowWithTags;
  const payload = { event, ...props };

  try {
    w.dataLayer?.push(payload);
    w.gtag?.("event", event, props);
    w.plausible?.(event, { props });
    window.dispatchEvent(new CustomEvent("aesthetic-index:analytics", { detail: payload }));
  } catch {
    /* analytics must never break the page */
  }

  if (import.meta.env.DEV) {
    console.debug("[analytics]", event, props);
  }
}

/**
 * Classifies the entry referrer so answer-engine traffic (ChatGPT Search,
 * Perplexity, Copilot, Google AI surfaces) can be told apart from ordinary
 * organic search. Only the coarse source name and landing path are recorded.
 */
const ANSWER_ENGINE_HOSTS: Array<[RegExp, string]> = [
  [/(^|\.)chatgpt\.com$/, "chatgpt"],
  [/(^|\.)openai\.com$/, "chatgpt"],
  [/(^|\.)perplexity\.ai$/, "perplexity"],
  [/(^|\.)copilot\.microsoft\.com$/, "copilot"],
  [/(^|\.)bing\.com$/, "bing"],
  [/(^|\.)gemini\.google\.com$/, "gemini"],
  [/(^|\.)claude\.ai$/, "claude"],
];

export function classifyReferrer(referrer: string, utmSource?: string | null): string | null {
  if (utmSource) {
    const s = utmSource.toLowerCase();
    if (s.includes("chatgpt")) return "chatgpt";
    if (s.includes("perplexity")) return "perplexity";
    if (s.includes("copilot")) return "copilot";
    if (s.includes("gemini")) return "gemini";
  }
  if (!referrer) return null;
  let host = "";
  try {
    host = new URL(referrer).hostname.toLowerCase();
  } catch {
    return null;
  }
  for (const [pattern, name] of ANSWER_ENGINE_HOSTS) {
    if (pattern.test(host)) return name;
  }
  return null;
}

/** Fires once per page load when the visit came from an answer engine. */
export function trackAnswerEngineReferral() {
  if (typeof window === "undefined") return;
  const utm = new URLSearchParams(window.location.search).get("utm_source");
  const source = classifyReferrer(document.referrer, utm);
  if (!source) return;
  trackEvent("answer_engine_referral", {
    source,
    landing_path: window.location.pathname,
    utm_source: utm ?? undefined,
  });
}
