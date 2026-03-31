"use client";

import { Zap } from "lucide-react";
import { StockLogo } from "@/components/StockLogo";
import { Card, CardContent } from "@/components/ui/card";
import { type Basket, getStockByTicker } from "@/lib/data";
import { cn } from "@/lib/utils";

export function BasketTemplateCard({
  basket,
  selected,
  onApply,
}: {
  basket: Basket;
  selected: boolean;
  onApply: () => void;
}) {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-primary/50",
        selected && "border-primary bg-primary/5",
      )}
      onClick={onApply}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Zap className="size-3.5 text-primary" />
          </div>
          <p className="text-sm font-semibold">{basket.name}</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {basket.description}
        </p>
        <div className="flex -space-x-1.5">
          {basket.allocations.slice(0, 5).map((alloc) => {
            const stock = getStockByTicker(alloc.ticker);
            if (!stock) return null;
            return (
              <StockLogo
                key={alloc.ticker}
                ticker={stock.ticker}
                color={stock.color}
                logo={stock.logo}
                size="sm"
              />
            );
          })}
          {basket.allocations.length > 5 && (
            <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">
              +{basket.allocations.length - 5}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
