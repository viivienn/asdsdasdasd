import { useEffect, useRef } from "react";
import { useAccount } from "@/components/account-provider";
import {
  canShowSecondComparisonPrompt,
  markPromptShown,
  registerComparisonView,
} from "@/lib/signup-prompt";

export function ComparisonSignupPrompt({ comparisonSlug }: { comparisonSlug: string }) {
  const { user, loading, openAccountPrompt } = useAccount();
  const eligible = useRef(false);
  const opened = useRef(false);

  useEffect(() => {
    const views = registerComparisonView(comparisonSlug);
    eligible.current = canShowSecondComparisonPrompt(views);
  }, [comparisonSlug]);

  useEffect(() => {
    if (loading || user || !eligible.current || opened.current) return;

    function show() {
      if (opened.current || !eligible.current) return;
      opened.current = true;
      markPromptShown();
      openAccountPrompt({ source: "second_comparison", nextPath: window.location.pathname });
    }

    const timer = window.setTimeout(show, 15_000);
    function onScroll() {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && window.scrollY / scrollable >= 0.5) show();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [loading, openAccountPrompt, user]);

  return null;
}
