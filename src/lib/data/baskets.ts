export type BasketAllocation = {
  ticker: string;
  weight: number;
};

export type Basket = {
  id: string;
  name: string;
  description: string;
  allocations: BasketAllocation[];
  totalValue: number;
  createdAt: string;
};

export const BASKETS: Basket[] = [
  {
    id: "basket-001",
    name: "Tech Giants",
    description: "Top technology companies with strong market positions",
    allocations: [
      { ticker: "NVDAx", weight: 25 },
      { ticker: "AAPLx", weight: 20 },
      { ticker: "MSFTx", weight: 20 },
      { ticker: "METAx", weight: 20 },
      { ticker: "AMZNx", weight: 15 },
    ],
    totalValue: 15420.5,
    createdAt: "2026-01-15",
  },
  {
    id: "basket-002",
    name: "Diversified",
    description: "Balanced mix across sectors for steady growth",
    allocations: [
      { ticker: "AAPLx", weight: 15 },
      { ticker: "NVDAx", weight: 15 },
      { ticker: "METAx", weight: 10 },
      { ticker: "AMZNx", weight: 10 },
      { ticker: "MCDx", weight: 10 },
      { ticker: "MRKx", weight: 10 },
      { ticker: "AZNx", weight: 10 },
      { ticker: "COINx", weight: 10 },
      { ticker: "HOODx", weight: 10 },
    ],
    totalValue: 8750.25,
    createdAt: "2026-02-01",
  },
  {
    id: "basket-003",
    name: "Crypto & Fintech",
    description: "Exposure to crypto-adjacent and fintech companies",
    allocations: [
      { ticker: "COINx", weight: 40 },
      { ticker: "HOODx", weight: 35 },
      { ticker: "TSLAx", weight: 25 },
    ],
    totalValue: 5230.0,
    createdAt: "2026-02-20",
  },
];
