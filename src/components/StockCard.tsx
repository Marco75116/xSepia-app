import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Stock } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/formatters";

export function StockCard({ stock }: { stock: Stock }) {
  const isPositive = stock.change24h >= 0;

  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/30 hover:shadow-[0_0_20px_oklch(0.75_0.18_160_/_8%)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${stock.color}10, transparent 70%)`,
        }}
      />
      <CardHeader className="relative flex-row items-center gap-3">
        <StockLogo
          ticker={stock.ticker}
          color={stock.color}
          logo={stock.logo}
        />
        <div className="min-w-0">
          <CardTitle className="tracking-wide">{stock.name}</CardTitle>
          <CardDescription className="tracking-wide">
            {stock.ticker}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="relative flex items-end justify-between">
        <div>
          <div className="text-lg font-medium font-mono">
            {formatCurrency(stock.price)}
          </div>
          <CardDescription className="mt-1 text-[11px] tracking-wide">
            {stock.sector} &middot; {stock.marketCap}
          </CardDescription>
        </div>
        <Badge
          variant={isPositive ? "default" : "destructive"}
          className="font-mono text-xs"
        >
          {formatPercent(stock.change24h)}
        </Badge>
      </CardContent>
    </Card>
  );
}
