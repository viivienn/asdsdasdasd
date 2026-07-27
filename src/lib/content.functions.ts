import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { createHash } from "crypto";
import { z } from "zod";

export const fetchTreatments = createServerFn({ method: "GET" }).handler(async () => {
  const { listTreatments } = await import("./content.server");
  return listTreatments();
});

export const fetchCompareIndex = createServerFn({ method: "GET" }).handler(async () => {
  const { listTreatments, listComparisonSlugs } = await import("./content.server");
  const [treatments, slugs] = await Promise.all([listTreatments(), listComparisonSlugs()]);
  return { treatments: treatments.data, slugs: slugs.data, isDemo: treatments.isDemo };
});

export const fetchTreatment = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().max(80) }).parse(input))
  .handler(async ({ data }) => {
    const { getTreatmentBySlug } = await import("./content.server");
    return getTreatmentBySlug(data.slug);
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

const cityRequestSchema = z.object({
  email: z.string().trim().email().max(254),
  postal_code: z.string().trim().min(3).max(12).regex(/^[A-Za-z0-9 -]+$/),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  treatment_slug: z.string().trim().max(80).optional().or(z.literal("")),
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

const priceAlertSchema = z.object({
  email: z.string().trim().email().max(254),
  postal_code: z.string().trim().min(3).max(12).regex(/^[A-Za-z0-9 -]+$/),
  treatment_slug: z.string().trim().min(1).max(80),
  max_unit_price: z.number().positive().max(100000).nullable().optional(),
  source_path: z.string().max(200).optional(),
  company: z.string().max(0).optional().or(z.literal("")),
});

export const submitPriceAlertInterest = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => priceAlertSchema.parse(input))
  .handler(async ({ data }) => {
    if (data.company) return { ok: false as const, error: "Submission rejected." };
    const ip = getRequestHeader("x-forwarded-for") ?? "unknown";
    const ipHash = createHash("sha256").update(ip).digest("hex");
    const { recordPriceAlertInterest } = await import("./content.server");
    return recordPriceAlertInterest({
      email: data.email,
      postal_code: data.postal_code,
      treatment_slug: data.treatment_slug,
      max_unit_price: data.max_unit_price ?? null,
      source_path: data.source_path ?? null,
      ipHash,
    });
  });