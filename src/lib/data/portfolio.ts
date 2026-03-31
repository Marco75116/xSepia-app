export type PortfolioHolding = {
  ticker: string;
  shares: number;
  avgBuyPrice: number;
};

export type PortfolioSnapshot = {
  date: string;
  totalValue: number;
};

export const PORTFOLIO_HOLDINGS: PortfolioHolding[] = [
  { ticker: "NVDAx", shares: 12, avgBuyPrice: 812.3 },
  { ticker: "AAPLx", shares: 25, avgBuyPrice: 215.6 },
  { ticker: "METAx", shares: 8, avgBuyPrice: 545.2 },
  { ticker: "TSLAx", shares: 15, avgBuyPrice: 192.4 },
  { ticker: "AMZNx", shares: 18, avgBuyPrice: 178.9 },
  { ticker: "COINx", shares: 10, avgBuyPrice: 195.5 },
  { ticker: "MSFTx", shares: 6, avgBuyPrice: 398.7 },
  { ticker: "NFLXx", shares: 3, avgBuyPrice: 845.1 },
];

export const PORTFOLIO_HISTORY: PortfolioSnapshot[] = Array.from(
  { length: 30 },
  (_, i) => {
    const date = new Date(2026, 2, 2 + i);
    const base = 42000;
    const trend = i * 180;
    const noise = Math.sin(i * 0.7) * 1200 + Math.cos(i * 1.3) * 800;
    return {
      date: date.toISOString().split("T")[0],
      totalValue: Math.round((base + trend + noise) * 100) / 100,
    };
  },
);
