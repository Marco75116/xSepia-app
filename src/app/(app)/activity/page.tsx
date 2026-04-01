"use client";

import {
  AlertCircle,
  ArrowDownLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  ShoppingCart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { ContentLayout } from "@/components/ContentLayout";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getChainConfig } from "@/lib/constants";
import { getStockByTicker } from "@/lib/data";
import { api } from "@/lib/eden";
import { formatCurrency, formatDate } from "@/lib/formatters";

type Order = {
  id: string;
  type: "buy" | "withdraw";
  vaultName: string;
  chainId: number;
  ticker: string;
  amount: string;
  status: string;
  orderUid: string | null;
  txHash: string | null;
  createdAt: string;
};

const statusConfig: Record<
  string,
  {
    label: string;
    icon: typeof Clock;
    variant: "secondary" | "default" | "destructive";
  }
> = {
  submitted: { label: "Submitted", icon: Clock, variant: "secondary" },
  filled: { label: "Filled", icon: CheckCircle2, variant: "default" },
  pending: { label: "Pending", icon: Clock, variant: "secondary" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, variant: "default" },
  failed: { label: "Failed", icon: AlertCircle, variant: "destructive" },
};

function getOrderExplorerUrl(order: Order): string | null {
  const chainConfig = getChainConfig(order.chainId);

  if (order.type === "buy" && order.orderUid) {
    if (chainConfig.swapProtocol === "cow") {
      return `https://explorer.cow.fi/ink/orders/${order.orderUid}`;
    }
    return `${chainConfig.explorerUrl}/tx/${order.orderUid}`;
  }

  if (order.type === "withdraw" && order.txHash) {
    return `${chainConfig.explorerUrl}/tx/${order.txHash}`;
  }

  return null;
}

export default function ActivityPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const { data, error } = await api.orders.get();
      if (!error && data) {
        setOrders(data as Order[]);
      }
      setLoading(false);
    }
    fetchOrders();
  }, []);

  return (
    <ContentLayout>
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">Activity</h1>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
            No activity yet
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Vault</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const stock = getStockByTicker(order.ticker);
                const config =
                  statusConfig[order.status] ?? statusConfig.pending;
                const StatusIcon = config.icon;
                const TypeIcon =
                  order.type === "buy" ? ShoppingCart : ArrowDownLeft;

                const externalUrl = getOrderExplorerUrl(order);

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <StockLogo
                          ticker={order.ticker}
                          color={stock?.color ?? "#666"}
                          logo={stock?.logo}
                          size="sm"
                        />
                        <span className="font-mono font-medium">
                          {order.ticker}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={order.type === "buy" ? "secondary" : "outline"}
                        className={
                          order.type === "buy"
                            ? "gap-1 border-positive/20 bg-positive/10 text-positive"
                            : "gap-1"
                        }
                      >
                        <TypeIcon className="size-3" />
                        {order.type === "buy" ? "Buy" : "Withdraw"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.vaultName}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium">
                      {order.type === "buy"
                        ? formatCurrency(Number(order.amount))
                        : order.amount}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={config.variant} className="gap-1">
                        <StatusIcon className="size-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {externalUrl && (
                        <a
                          href={externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </ContentLayout>
  );
}
