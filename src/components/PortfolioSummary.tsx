import { BarChart3, Star, TrendingDown, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStockByTicker, PORTFOLIO_HOLDINGS, STOCKS } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/formatters";

function computeStats() {
  let totalValue = 0;
  let totalCost = 0;
  let bestTicker = "";
  let bestReturn = -Infinity;

  for (const holding of PORTFOLIO_HOLDINGS) {
    const stock = getStockByTicker(holding.ticker);
    if (!stock) continue;
    const currentVal = holding.shares * stock.price;
    const costVal = holding.shares * holding.avgBuyPrice;
    totalValue += currentVal;
    totalCost += costVal;

    const returnPct =
      ((stock.price - holding.avgBuyPrice) / holding.avgBuyPrice) * 100;
    if (returnPct > bestReturn) {
      bestReturn = returnPct;
      bestTicker = holding.ticker;
    }
  }

  const totalGain = totalValue - totalCost;
  const totalGainPct = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    totalValue,
    totalGain,
    totalGainPct,
    bestTicker,
    bestReturn,
    holdingsCount: PORTFOLIO_HOLDINGS.length,
  };
}

export function PortfolioSummary() {
  const stats = computeStats();
  const isPositive = stats.totalGain >= 0;
  const bestStock = STOCKS.find((s) => s.ticker === stats.bestTicker);

  const cards = [
    {
      label: "Portfolio Value",
      value: formatCurrency(stats.totalValue),
      icon: BarChart3,
      accent: false,
    },
    {
      label: "Total Gain/Loss",
      value: `${formatCurrency(Math.abs(stats.totalGain))} (${formatPercent(stats.totalGainPct)})`,
      icon: isPositive ? TrendingUp : TrendingDown,
      accent: true,
      positive: isPositive,
    },
    {
      label: "Holdings",
      value: `${stats.holdingsCount} stocks`,
      icon: BarChart3,
      accent: false,
    },
    {
      label: "Best Performer",
      value: `${bestStock?.name ?? stats.bestTicker} (${formatPercent(stats.bestReturn)})`,
      icon: Star,
      accent: true,
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardDescription className="flex items-center gap-2 text-[11px] uppercase tracking-widest">
              <card.icon className="size-4" />
              {card.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CardTitle
              className={`text-xl font-mono ${
                card.accent
                  ? card.positive
                    ? "text-primary"
                    : "text-destructive"
                  : ""
              }`}
            >
              {card.value}
            </CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
