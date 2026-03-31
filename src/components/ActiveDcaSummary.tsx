import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DCA_STRATEGIES, getStockByTicker, INTERVAL_LABELS } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

export function ActiveDcaSummary() {
  const active = DCA_STRATEGIES.filter((s) => s.status === "active");

  if (active.length === 0) return null;

  return (
    <div className="mb-6">
      <CardDescription className="mb-3">Active DCA Strategies</CardDescription>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {active.map((strategy) => {
          const stock = getStockByTicker(strategy.ticker);
          return (
            <Card
              key={strategy.id}
              size="sm"
              className="min-w-[220px] shrink-0"
            >
              <CardHeader className="flex-row items-center gap-2">
                <StockLogo
                  ticker={strategy.ticker}
                  color={stock?.color ?? "#666"}
                  logo={stock?.logo}
                  size="sm"
                />
                <CardTitle>{stock?.name}</CardTitle>
                <CardAction>
                  <Badge variant="default" className="text-[10px]">
                    {INTERVAL_LABELS[strategy.interval]}
                  </Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between">
                  <CardDescription className="text-xs">
                    {formatCurrency(strategy.amount)}/interval
                  </CardDescription>
                  <CardDescription className="text-xs">
                    {strategy.executionCount} buys
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
