import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getStockByTicker, PORTFOLIO_HOLDINGS } from "@/lib/data";
import { formatCurrency, formatPercent } from "@/lib/formatters";

export function HoldingsTable() {
  const holdings = PORTFOLIO_HOLDINGS.map((h) => {
    const stock = getStockByTicker(h.ticker);
    const currentValue = h.shares * (stock?.price ?? 0);
    const costBasis = h.shares * h.avgBuyPrice;
    const pnl = currentValue - costBasis;
    const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, stock, currentValue, costBasis, pnl, pnlPct };
  }).sort((a, b) => b.currentValue - a.currentValue);

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Stock</TableHead>
          <TableHead className="text-right">Shares</TableHead>
          <TableHead className="text-right">Avg Price</TableHead>
          <TableHead className="text-right">Current</TableHead>
          <TableHead className="text-right">Value</TableHead>
          <TableHead className="text-right">P&L</TableHead>
          <TableHead className="text-right">Allocation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {holdings.map((h) => {
          const isPositive = h.pnl >= 0;
          return (
            <TableRow key={h.ticker}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StockLogo
                    ticker={h.ticker}
                    color={h.stock?.color ?? "#666"}
                    logo={h.stock?.logo}
                    size="sm"
                  />
                  <div>
                    <div className="font-medium">{h.stock?.name}</div>
                    <CardDescription className="text-xs">
                      {h.ticker}
                    </CardDescription>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-right font-mono">{h.shares}</TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(h.avgBuyPrice)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(h.stock?.price ?? 0)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(h.currentValue)}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={isPositive ? "default" : "destructive"}
                  className="font-mono text-xs"
                >
                  {formatPercent(h.pnlPct)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Badge variant="secondary" className="font-mono text-xs">
                  {((h.currentValue / totalValue) * 100).toFixed(1)}%
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
