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
  | "alert_signup_success";

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
