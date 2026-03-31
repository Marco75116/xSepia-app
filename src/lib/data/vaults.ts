export type VaultAllocation = {
  ticker: string;
  weight: number;
  currentValue: number;
};

export type VaultPerformanceSnapshot = {
  date: string;
  totalValue: number;
};

export type Vault = {
  id: string;
  name: string;
  description: string;
  allocations: VaultAllocation[];
  totalValue: number;
  totalGainAmount: number;
  totalGainPercent: number;
  dailyGainAmount: number;
  dailyGainPercent: number;
  frequency: "daily" | "weekly" | "monthly";
  investmentPerExecution: number;
  status: "active" | "paused";
  rebalanceDay: string;
  rebalanceTime: string;
  nextRebalance: string;
  createdAt: string;
  labels: string[];
  performanceHistory: VaultPerformanceSnapshot[];
  benchmarkDelta: number;
};

function generatePerformanceHistory(
  baseValue: number,
  days: number,
): VaultPerformanceSnapshot[] {
  const history: VaultPerformanceSnapshot[] = [];
  let value = baseValue * 0.92;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    value = value * (1 + (Math.random() * 0.03 - 0.008));
    history.push({
      date: date.toISOString().split("T")[0],
      totalValue: Math.round(value * 100) / 100,
    });
  }
  return history;
}

export const VAULTS: Vault[] = [
  {
    id: "tech-btc-growth",
    name: "Tech + BTC Growth",
    description:
      "Invest $500 into Tesla, Amazon and Bitcoin, rebalances weekly",
    allocations: [
      { ticker: "TSLAx", weight: 33, currentValue: 1591 },
      { ticker: "AMZNx", weight: 33, currentValue: 1591 },
      { ticker: "BTC", weight: 34, currentValue: 1638 },
    ],
    totalValue: 4820,
    totalGainAmount: 145.2,
    totalGainPercent: 3.1,
    dailyGainAmount: 98.4,
    dailyGainPercent: 5.2,
    frequency: "weekly",
    investmentPerExecution: 500,
    status: "active",
    rebalanceDay: "Monday",
    rebalanceTime: "09:00 AM UTC",
    nextRebalance: "2026-04-03",
    createdAt: "2026-01-15",
    labels: ["REBALANCES WEEKLY"],
    performanceHistory: generatePerformanceHistory(4820, 30),
    benchmarkDelta: 1.2,
  },
  {
    id: "yield-accumulator",
    name: "Yield Accumulator",
    description: "Auto-buys on deposit across blue-chip stocks",
    allocations: [
      { ticker: "AAPLx", weight: 25, currentValue: 1907.5 },
      { ticker: "MSFTx", weight: 25, currentValue: 1907.5 },
      { ticker: "NVDAx", weight: 25, currentValue: 1907.5 },
      { ticker: "METAx", weight: 25, currentValue: 1907.5 },
    ],
    totalValue: 7630,
    totalGainAmount: 83.93,
    totalGainPercent: 1.1,
    dailyGainAmount: 42.1,
    dailyGainPercent: 1.1,
    frequency: "monthly",
    investmentPerExecution: 1000,
    status: "active",
    rebalanceDay: "1st",
    rebalanceTime: "09:00 AM UTC",
    nextRebalance: "2026-04-01",
    createdAt: "2026-02-01",
    labels: ["AUTO-BUYS ON DEPOSIT"],
    performanceHistory: generatePerformanceHistory(7630, 30),
    benchmarkDelta: 0.8,
  },
];

export function getVaultById(id: string): Vault | undefined {
  return VAULTS.find((v) => v.id === id);
}
