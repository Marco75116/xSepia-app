import { StockLogo } from "@/components/StockLogo";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Basket } from "@/lib/data";
import { getStockByTicker } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

export function BasketCard({ basket }: { basket: Basket }) {
  return (
    <Card className="transition-all hover:border-primary/20 hover:shadow-[0_0_20px_oklch(0.75_0.18_160_/_6%)]">
      <CardHeader>
        <CardTitle>{basket.name}</CardTitle>
        <CardAction>
          <span className="text-sm font-mono text-muted-foreground">
            {formatCurrency(basket.totalValue)}
          </span>
        </CardAction>
        <CardDescription>{basket.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {basket.allocations.map((alloc) => {
          const stock = getStockByTicker(alloc.ticker);
          return (
            <div key={alloc.ticker} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <StockLogo
                    ticker={alloc.ticker}
                    color={stock?.color ?? "#666"}
                    logo={stock?.logo}
                    size="sm"
                  />
                  <span>{stock?.name ?? alloc.ticker}</span>
                </div>
                <span className="font-mono text-muted-foreground">
                  {alloc.weight}%
                </span>
              </div>
              <Progress value={alloc.weight} className="h-1.5" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
