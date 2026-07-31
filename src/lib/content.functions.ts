import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createHash } from "crypto";
import { z } from "zod";

export const fetchTreatments = createServerFn({ method: "GET" }).handler(async () => {
  const { listTreatments } = await import("./content.server");
  return listTreatments();
});

export const fetchCatalog = createServerFn({ method: "GET" }).handler(async () => {
  const { listCatalog, listComparisonExperience } = await import("./content.server");
  const [entries, experience] = await Promise.all([listCatalog(), listComparisonExperience()]);
  const experienceById = new Map(
    experience.treatments.map((treatment) => [treatment.id, treatment]),
  );
  return {
    entries: entries.map((entry) => ({
      ...entry,
      comparison_groups: experienceById.get(entry.id)?.comparison_groups ?? [],
      markets: experienceById.get(entry.id)?.markets ?? [],
      media: experienceById.get(entry.id)?.media ?? entry.media,
    })),
    comparisons: experience.comparisons,
    popularComparisons: experience.popularComparisons,
  };
});

export const fetchCompareIndex = createServerFn({ method: "GET" }).handler(async () => {
  const { listComparisonExperience } = await import("./content.server");
  const experience = await listComparisonExperience();
  return {
    ...experience,
    reviewedSlugs: experience.comparisons.map((comparison) => comparison.slug),
  };
});

export const fetchSearchIndex = createServerFn({ method: "GET" }).handler(async () => {
  const { listComparisonExperience } = await import("./content.server");
  return listComparisonExperience();
});

export const fetchTreatment = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { getTreatmentBySlug, listComparisonExperience } = await import("./content.server");
    const [record, experience] = await Promise.all([
      getTreatmentBySlug(data.slug),
      listComparisonExperience(),
    ]);
    return { ...record, experience };
  });

export const fetchComparison = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { getComparisonBySlug, listTreatments } = await import("./content.server");
    const [comparison, treatments] = await Promise.all([
      getComparisonBySlug(data.slug),
      listTreatments(),
    ]);
    return { comparison, treatments };
  });

export const fetchCityPrices = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ city: z.string().max(80), treatment: z.string().max(80) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { listCityPrices } = await import("./content.server");
    return listCityPrices(data.city, data.treatment);
  });

export const fetchRegionalPriceEstimate = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        postalCode: z.string().trim().min(3).max(12),
        treatmentSlug: z
          .string()
          .trim()
          .min(1)
          .max(80)
          .regex(/^[a-z0-9-]+$/),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { getRegionalPriceEstimate } = await import("./content.server");
    return getRegionalPriceEstimate(data.postalCode, data.treatmentSlug);
  });

export const fetchComparisonPair = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z
      .object({
        a: z.string().max(80),
        b: z.string().max(80),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { getComparisonContext, listReviewedComparisonSlugs } = await import("./content.server");
    const [context, reviewedSlugs] = await Promise.all([
      getComparisonContext(data.a, data.b),
      listReviewedComparisonSlugs(),
    ]);
    return { ...context, reviewedSlugs };
  });

const cityRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  postal_code: z
    .string()
    .trim()
    .min(3)
    .max(12)
    .regex(/^[A-Za-z0-9 -]+$/),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  treatment_slug: z
    .string()
    .trim()
    .max(80)
    .regex(/^[a-z0-9-]*$/)
    .optional()
    .or(z.literal("")),
  consent: z.literal(true),
  source_path: z.string().max(200).optional(),
  company: z.string().max(0).optional().or(z.literal("")),
});

export const submitCityRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => cityRequestSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.company) return { ok: false as const, error: "Submission rejected." };
    const ip = getRequestHeader("x-forwarded-for") ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");
    const { recordCityRequest } = await import("./content.server");
    return recordCityRequest({
      email: data.email,
      postal_code: data.postal_code,
      city: data.city || null,
      treatment_slug: data.treatment_slug || null,
      consent: true,
      source_path: data.source_path ?? null,
      ipHash,
    });
  });

const comparisonRequestSchema = z.object({
  treatment_a: z.string().trim().min(2).max(80),
  treatment_b: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  context: z.string().trim().max(1000).optional().or(z.literal("")),
  source_path: z.string().max(200).optional(),
  company: z.string().max(0).optional().or(z.literal("")),
});

export const submitComparisonRequest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => comparisonRequestSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.company) return { ok: false as const, error: "Submission rejected." };
    const ip = getRequestHeader("x-forwarded-for") ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");
    const { recordComparisonRequest } = await import("./content.server");
    return recordComparisonRequest({
      treatment_a: data.treatment_a,
      treatment_b: data.treatment_b,
      email: data.email || null,
      context: data.context || null,
      source_path: data.source_path ?? null,
      ipHash,
    });
  });
