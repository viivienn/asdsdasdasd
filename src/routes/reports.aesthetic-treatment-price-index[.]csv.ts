import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listRegionalPriceLandings } from "@/lib/content.server";
import { FEATURES } from "@/lib/features";
import { renderPriceIndexCsv } from "@/lib/price-index";

export const Route = createFileRoute("/reports/aesthetic-treatment-price-index.csv")({
  server: {
    handlers: {
      GET: async () => {
        if (!FEATURES.priceIndexReport) return new Response("Not found", { status: 404 });
        const csv = renderPriceIndexCsv(await listRegionalPriceLandings());
        if (!csv) return new Response("Not found", { status: 404 });
        return new Response(csv, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": "attachment; filename=aesthetic-treatment-price-index.csv",
            "X-Robots-Tag": "noindex",
          },
        });
      },
    },
  },
});
