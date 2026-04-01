import { Elysia, t } from "elysia";

type PolymarketTag = {
  id: number;
  label: string;
  slug: string;
};

type PolymarketEvent = {
  id: string;
  title: string;
  slug: string;
  image: string;
  icon: string;
  tags: PolymarketTag[];
  markets: {
    id: string;
    question: string;
    image: string;
    icon: string;
    outcomePrices: string;
    volume: number;
    active: boolean;
    closed: boolean;
    endDate: string;
  }[];
};

export type Signal = {
  id: string;
  question: string;
  category: string;
  probability: number;
  volume: number;
  endDate: string;
  image: string;
};

const CATEGORY_TAG_IDS: Record<string, number> = {
  stocks: 604,
  fed_macro: 100328,
  commodities: 100265,
  forex: 120,
  crypto: 21,
  ma: 107,
  indices: 604,
  earnings: 107,
};

const CATEGORIES = [
  { key: "stocks", label: "Stocks" },
  { key: "fed_macro", label: "Macro" },
  { key: "commodities", label: "Commodities" },
  { key: "forex", label: "Forex" },
  { key: "crypto", label: "Crypto" },
  { key: "ma", label: "M&A" },
  { key: "indices", label: "Indices" },
  { key: "earnings", label: "Earnings" },
];

const TAG_ID_TO_CATEGORY = new Map<number, string>([
  [604, "stocks"],
  [100328, "fed_macro"],
  [100265, "commodities"],
  [120, "forex"],
  [21, "crypto"],
  [107, "ma"],
]);

function findCategoryForEvent(tags: PolymarketTag[]): string {
  for (const t of tags) {
    const cat = TAG_ID_TO_CATEGORY.get(t.id);
    if (cat) return cat;
  }
  const slugs = new Set(tags.map((t) => t.slug.toLowerCase()));
  if (slugs.has("stocks") || slugs.has("stock-market")) return "stocks";
  if (slugs.has("fed") || slugs.has("interest-rates") || slugs.has("macro"))
    return "fed_macro";
  if (slugs.has("gold") || slugs.has("oil") || slugs.has("commodities"))
    return "commodities";
  if (slugs.has("forex") || slugs.has("currencies")) return "forex";
  if (slugs.has("crypto") || slugs.has("bitcoin") || slugs.has("ethereum"))
    return "crypto";
  if (slugs.has("mergers") || slugs.has("acquisitions")) return "ma";
  if (slugs.has("earnings")) return "earnings";
  if (slugs.has("indices") || slugs.has("sp500") || slugs.has("nasdaq"))
    return "indices";
  return "stocks";
}

export const signalRoutes = new Elysia().get(
  "/signals",
  async ({ query }) => {
    const tag = query.tag;
    const limit = Number(query.limit ?? 20);

    const params = new URLSearchParams({
      active: "true",
      closed: "false",
      limit: String(limit),
      order: "volume24hr",
      ascending: "false",
    });

    if (tag && CATEGORY_TAG_IDS[tag]) {
      params.set("tag_id", String(CATEGORY_TAG_IDS[tag]));
    }

    const res = await fetch(
      `https://gamma-api.polymarket.com/events?${params.toString()}`,
    );

    if (!res.ok) {
      console.error(
        `[signals] Polymarket API error: ${res.status} ${res.statusText}`,
      );
      return { signals: [], categories: CATEGORIES };
    }

    const events: PolymarketEvent[] = await res.json();

    const signals: Signal[] = events.flatMap((event) =>
      event.markets
        .filter((m) => m.active && !m.closed)
        .map((m) => {
          let probability = 0;
          try {
            const prices = JSON.parse(m.outcomePrices);
            probability = Number.parseFloat(prices[0]) || 0;
          } catch {
            probability = 0;
          }

          const category = tag || findCategoryForEvent(event.tags ?? []);

          return {
            id: m.id,
            question: m.question || event.title,
            category,
            probability,
            volume: m.volume,
            endDate: m.endDate,
            image: m.image || event.image || "",
          };
        }),
    );

    signals.sort((a, b) => b.volume - a.volume);

    return {
      signals: signals.slice(0, limit),
      categories: CATEGORIES,
    };
  },
  {
    query: t.Object({
      tag: t.Optional(t.String()),
      limit: t.Optional(t.String()),
    }),
  },
);
