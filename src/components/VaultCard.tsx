import Link from "next/link";
import { StockLogo } from "@/components/StockLogo";
import { Card, CardContent } from "@/components/ui/card";
import type { Vault } from "@/lib/data";
import { getStockByTicker } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

export function VaultCard({ vault }: { vault: Vault }) {
  return (
    <Link href={`/vault/${vault.id}`}>
      <Card className="border-border bg-card transition-colors hover:bg-accent">
        <CardContent className="space-y-2.5 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold">{vault.name}</h3>
              <p className="text-[11px] text-muted-foreground">
                {vault.labels[0]?.charAt(0).toUpperCase()}
                {vault.labels[0]?.slice(1).toLowerCase()}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {vault.allocations.slice(0, 3).map((alloc) => {
                const stock = getStockByTicker(alloc.ticker);
                return (
                  <StockLogo
                    key={alloc.ticker}
                    ticker={alloc.ticker}
                    color={stock?.color ?? "#666"}
                    logo={stock?.logo}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <p className="font-mono text-xl font-bold">
              {formatCurrency(vault.totalValue)}
            </p>
            <span className="font-mono text-xs font-medium text-primary">
              +{vault.dailyGainPercent.toFixed(1)}%
            </span>
          </div>

          <div className="h-0.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary/60"
              style={{
                width: `${Math.min(vault.dailyGainPercent * 10, 100)}%`,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
