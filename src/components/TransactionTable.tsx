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
import { getStockByTicker, TRANSACTIONS } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export function TransactionTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Shares</TableHead>
          <TableHead className="text-right">Price</TableHead>
          <TableHead className="text-right">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {TRANSACTIONS.map((tx) => {
          const stock = getStockByTicker(tx.ticker);
          return (
            <TableRow key={tx.id}>
              <TableCell>
                <CardDescription>{formatDate(tx.date)}</CardDescription>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <StockLogo
                    ticker={tx.ticker}
                    color={stock?.color ?? "#666"}
                    logo={stock?.logo}
                    size="sm"
                  />
                  <Badge variant="outline" className="font-medium">
                    {tx.ticker}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={tx.type === "buy" ? "default" : "secondary"}>
                  {tx.type}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(tx.amount)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {tx.shares}
              </TableCell>
              <TableCell className="text-right font-mono">
                {formatCurrency(tx.price)}
              </TableCell>
              <TableCell className="text-right">
                <Badge
                  variant={
                    tx.status === "completed"
                      ? "default"
                      : tx.status === "pending"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-xs"
                >
                  {tx.status}
                </Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
