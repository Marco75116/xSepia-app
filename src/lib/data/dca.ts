export type DcaStrategy = {
  id: string;
  ticker: string;
  amount: number;
  interval: "daily" | "weekly" | "monthly";
  startDate: string;
  nextExecution: string;
  totalInvested: number;
  executionCount: number;
  status: "active" | "paused";
};

export const DCA_STRATEGIES: DcaStrategy[] = [
  {
    id: "dca-001",
    ticker: "NVDAx",
    amount: 500,
    interval: "weekly",
    startDate: "2026-01-06",
    nextExecution: "2026-04-01",
    totalInvested: 6000,
    executionCount: 12,
    status: "active",
  },
  {
    id: "dca-002",
    ticker: "AAPLx",
    amount: 200,
    interval: "daily",
    startDate: "2026-03-01",
    nextExecution: "2026-03-31",
    totalInvested: 6000,
    executionCount: 30,
    status: "active",
  },
  {
    id: "dca-003",
    ticker: "METAx",
    amount: 1000,
    interval: "monthly",
    startDate: "2025-10-01",
    nextExecution: "2026-04-01",
    totalInvested: 6000,
    executionCount: 6,
    status: "active",
  },
  {
    id: "dca-004",
    ticker: "TSLAx",
    amount: 300,
    interval: "weekly",
    startDate: "2026-02-03",
    nextExecution: "2026-04-01",
    totalInvested: 2400,
    executionCount: 8,
    status: "paused",
  },
];

export const INTERVAL_LABELS: Record<DcaStrategy["interval"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};
