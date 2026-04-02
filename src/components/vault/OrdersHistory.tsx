"use client";

import { AlertCircle, CheckCircle2, Clock, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getChainConfig } from "@/lib/constants";
import { getStockByTicker } from "@/lib/data";
import { api } from "@/lib/eden";
import { formatCurrency } from "@/lib/formatters";

type BuyOrder = {
  id: string;
  ticker: string;
  tokenAddress: string;
  sellAmountUsdc: string;
  orderUid: string | null;
  status: string;
  error: string | null;
  createdAt: string;
};

type WithdrawOrder = {
  id: string;
  ticker: string;
  tokenAddress: string;
  amount: string;
  txHash: string | null;
  status: string;
  createdAt: string;
};

type SellOrder = {
  id: string;
  ticker: string;
  tokenAddress: string;
  sellAmount: string;
  orderUid: string | null;
  status: string;
  error: string | null;
  createdAt: string;
};

type UnifiedOrder = {
  id: string;
  type: "buy" | "withdraw" | "sell";
  ticker: string;
  amount: string;
  status: string;
  createdAt: string;
  orderUid?: string | null;
  txHash?: string | null;
};

const buyStatusConfig = {
  submitted: {
    label: "Submitted",
    icon: Clock,
    variant: "secondary" as const,
  },
  filled: {
    label: "Filled",
    icon: CheckCircle2,
    variant: "default" as const,
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    variant: "destructive" as const,
  },
};

const withdrawStatusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    variant: "secondary" as const,
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    variant: "default" as const,
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    variant: "destructive" as const,
  },
};

function formatDateTime(date: string): string {
  const parsed = /^\d+$/.test(date) ? new Date(Number(date)) : new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function getOrderExplorerUrl(
  order: UnifiedOrder,
  chainId: number,
): string | null {
  const chainConfig = getChainConfig(chainId);

  if ((order.type === "buy" || order.type === "sell") && order.orderUid) {
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

export function OrdersHistory({
  vaultId,
  chainId,
}: {
  vaultId: string;
  chainId: number;
}) {
  const [orders, setOrders] = useState<UnifiedOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      const [buyResult, withdrawResult, sellResult] = await Promise.all([
        api.vault({ id: vaultId }).orders.get(),
        api.vault({ id: vaultId }).withdrawals.get(),
        api.vault({ id: vaultId }).sells.get(),
      ]);

      const unified: UnifiedOrder[] = [];

      if (!buyResult.error && buyResult.data) {
        for (const o of buyResult.data as BuyOrder[]) {
          unified.push({
            id: o.id,
            type: "buy",
            ticker: o.ticker,
            amount: o.sellAmountUsdc,
            status: o.status,
            createdAt: o.createdAt,
            orderUid: o.orderUid,
          });
        }
      }

      if (!withdrawResult.error && withdrawResult.data) {
        for (const o of withdrawResult.data as WithdrawOrder[]) {
          unified.push({
            id: o.id,
            type: "withdraw",
            ticker: o.ticker,
            amount: o.amount,
            status: o.status,
            createdAt: o.createdAt,
            txHash: o.txHash,
          });
        }
      }

      if (!sellResult.error && sellResult.data) {
        for (const o of sellResult.data as SellOrder[]) {
          unified.push({
            id: o.id,
            type: "sell",
            ticker: o.ticker,
            amount: o.sellAmount,
            status: o.status,
            createdAt: o.createdAt,
            orderUid: o.orderUid,
          });
        }
      }

      unified.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

      setOrders(unified);
      setLoading(false);
    }
    fetchOrders();
  }, [vaultId]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Order History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Order History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            No orders yet
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Order History</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {orders.map((order, i) => {
          const stock = getStockByTicker(order.ticker);
          const statusMap =
            order.type === "withdraw" ? withdrawStatusConfig : buyStatusConfig;
          const config =
            statusMap[order.status as keyof typeof statusMap] ??
            buyStatusConfig.submitted;
          const StatusIcon = config.icon;

          const externalUrl = getOrderExplorerUrl(order, chainId);

          return (
            <div key={order.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <StockLogo
                    ticker={order.ticker}
                    color={stock?.color ?? "#666"}
                    logo={stock?.logo}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {stock?.name ?? order.ticker}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-mono text-sm font-medium">
                    {order.type === "buy"
                      ? formatCurrency(Number(order.amount))
                      : order.amount}
                  </p>
                  <Badge variant={config.variant} className="gap-1">
                    <StatusIcon className="size-3" />
                    {config.label}
                  </Badge>
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
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
