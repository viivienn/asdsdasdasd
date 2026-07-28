import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listTreatments from "./tools/list-treatments";
import getTreatment from "./tools/get-treatment";
import listComparisons from "./tools/list-comparisons";
import listPriceObservations from "./tools/list-price-observations";
import listSitePages from "./tools/list-site-pages";
import suggestChange from "./tools/suggest-change";
import listSuggestions from "./tools/list-suggestions";
import updateTreatment from "./tools/update-treatment";

// The OAuth issuer must be the direct Supabase host; the project ref is the
// only value that survives publish unchanged.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "aesthetic-index-mcp",
  title: "Aesthetic Index",
  version: "0.1.0",
  instructions: [
    "Tools for Aesthetic Index, an independent consumer site comparing cosmetic treatments and publicly listed local prices.",
    "Use list_site_pages to get the live URLs and open them to review how pages look.",
    "Use list_treatments, get_treatment, list_comparisons and list_price_observations to inspect the underlying content and find gaps.",
    "To propose work, call suggest_change — include a ready-to-paste Lovable prompt in the body when the change needs code or design work. Check list_suggestions first to avoid duplicates.",
    "update_treatment_fields writes editorial text directly and only works for admin accounts.",
    "Editorial rules: never write medical advice, diagnosis, treatment recommendations or dosage. Keep phrasing neutral (\"commonly used for\"), and cite a source URL for every factual claim.",
  ].join(" "),
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listSitePages,
    listTreatments,
    getTreatment,
    listComparisons,
    listPriceObservations,
    listSuggestions,
    suggestChange,
    updateTreatment,
  ],
});