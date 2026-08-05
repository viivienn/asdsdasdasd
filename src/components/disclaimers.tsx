/**
 * Canonical medical / pricing disclaimer copy. Every surface renders the same
 * wording from here so it cannot drift page to page.
 */
import { Link } from "@tanstack/react-router";

export const FOOTER_DISCLAIMER =
  "Aesthetic Index provides general educational information and aggregates publicly available pricing data. It does not provide medical advice, diagnosis, treatment recommendations, or guarantees of results. Treatment suitability, risks, outcomes, and pricing vary. Consult a qualified licensed healthcare professional before making treatment decisions.";

export function MedicalDisclaimerLink() {
  return (
    <Link to="/medical-disclaimer" className="underline underline-offset-4">
      Read the Medical Disclaimer.
    </Link>
  );
}

function Panel({
  heading,
  children,
  label,
}: {
  heading?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      role="note"
      aria-label={label}
      className="mt-12 border-l-2 border-primary bg-card px-5 py-4"
    >
      {heading ? <h2 className="text-base font-medium">{heading}</h2> : null}
      <div className="max-w-2xl space-y-3 text-sm leading-relaxed text-muted-foreground [&>p:first-child]:mt-0">
        {children}
      </div>
      <p className="mt-3 text-sm">
        <Link to="/medical-disclaimer" className="underline underline-offset-4">
          Medical Disclaimer
        </Link>
      </p>
    </aside>
  );
}

export function ComparisonDisclaimer() {
  return (
    <Panel heading="Educational information only" label="Educational information only">
      <p className="mt-2">
        This comparison is intended to help readers understand commonly reported differences between
        aesthetic treatments. It is not a personalized treatment recommendation and should not be
        used to diagnose a condition, select a procedure, or replace an evaluation by a qualified
        licensed healthcare professional.
      </p>
      <p>
        Treatment risks, results, contraindications, product selection, dosage, device settings, and
        suitability depend on individual anatomy, medical history, provider technique, and other
        factors.
      </p>
    </Panel>
  );
}

export function TreatmentDisclaimer() {
  return (
    <Panel label="Medical disclaimer">
      <p className="mt-0">
        This page provides general educational information and is not medical advice. It does not
        determine whether this treatment is appropriate or safe for you. Consult a qualified
        licensed healthcare professional for an individualized assessment.
      </p>
    </Panel>
  );
}

export function PricingDisclaimer({ className = "" }: { className?: string }) {
  return (
    <aside
      role="note"
      aria-label="Pricing notice"
      className={`border-l-2 border-primary bg-card px-5 py-4 ${className}`}
    >
      <h2 className="text-base font-medium">Pricing notice</h2>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        Prices shown are publicly listed or otherwise sourced observations captured on the displayed
        verification date. They are not quotes or guarantees. Final cost may vary based on provider,
        treatment area, quantity, consultation requirements, membership status, promotions, taxes,
        and individual treatment needs. Confirm all pricing directly with the clinic before booking
        or purchasing.
      </p>
      <p className="mt-3 text-sm">
        <Link to="/medical-disclaimer" className="underline underline-offset-4">
          Medical Disclaimer
        </Link>
      </p>
    </aside>
  );
}
