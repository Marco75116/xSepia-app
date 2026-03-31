"use client";

import {
  ArrowLeft,
  Bell,
  Pause,
  Pencil,
  PlusCircle,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { StockLogo } from "@/components/StockLogo";
import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { getStockByTicker, getVaultById } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

const chartConfig: ChartConfig = {
  totalValue: {
    label: "Vault Value",
    color: "#5ef5a0",
  },
};

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const vault = getVaultById(id);

  if (!vault) {
    notFound();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded p-1 text-primary transition-colors hover:bg-primary/10"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <h1 className="text-sm font-semibold text-primary">{vault.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary uppercase">
            {vault.status}
          </span>
          <button
            type="button"
            className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
          >
            <Bell className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-center">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Total Vault Value
        </p>
        <p className="font-mono text-3xl font-bold tracking-tight">
          {formatCurrency(vault.totalValue)}
        </p>
        <p className="font-mono text-xs">
          <span className="text-primary">
            +{formatCurrency(vault.totalGainAmount)}
          </span>
          <span className="text-muted-foreground"> · </span>
          <span className="text-primary">
            +{vault.totalGainPercent.toFixed(1)}% all time
          </span>
        </p>
      </div>

      <div className="flex h-1.5 gap-px overflow-hidden rounded">
        {vault.allocations.map((alloc) => {
          const stock = getStockByTicker(alloc.ticker);
          return (
            <div
              key={alloc.ticker}
              className="h-full"
              style={{
                width: `${alloc.weight}%`,
                backgroundColor: stock?.color ?? "#666",
              }}
            />
          );
        })}
      </div>

      <div className="space-y-1.5">
        {vault.allocations.map((alloc) => {
          const stock = getStockByTicker(alloc.ticker);
          return (
            <Card key={alloc.ticker} className="border-border bg-card">
              <CardContent className="flex items-center justify-between p-3">
                <div className="flex items-center gap-2.5">
                  <StockLogo
                    ticker={alloc.ticker}
                    color={stock?.color ?? "#666"}
                    logo={stock?.logo}
                    size="sm"
                  />
                  <div>
                    <p className="text-xs font-medium">
                      {stock?.name ?? alloc.ticker}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {alloc.ticker} · {alloc.weight}%
                    </p>
                  </div>
                </div>
                <p className="font-mono text-xs font-semibold">
                  {formatCurrency(alloc.currentValue)}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="flex items-start gap-2.5 p-3.5">
          <div className="mt-0.5 rounded bg-primary/10 p-1.5">
            <RefreshCw className="size-3.5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-semibold">Auto-Rebalance Active</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Every {vault.rebalanceDay} at {vault.rebalanceTime}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              Next rebalance in 3 days
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            30 Day Performance
          </p>
          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-medium text-primary">
            Outperforming SPY by {vault.benchmarkDelta}%
          </span>
        </div>

        <ChartContainer config={chartConfig} className="h-[100px] w-full">
          <AreaChart
            data={vault.performanceHistory}
            margin={{ top: 5, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="vaultFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#5ef5a0" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#5ef5a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              horizontal={false}
              stroke="#ffffff05"
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickFormatter={(val: string) => {
                const d = new Date(val);
                return `${d.toLocaleString("en", { month: "short" }).toUpperCase()}`;
              }}
              tick={{ fontSize: 9, fill: "#6b6b6b" }}
              interval="preserveStartEnd"
            />
            <Area
              type="monotone"
              dataKey="totalValue"
              stroke="#5ef5a0"
              strokeWidth={1.5}
              fill="url(#vaultFill)"
            />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-1 rounded-lg bg-primary py-2.5 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PlusCircle className="size-4" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Add Funds
          </span>
        </button>
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-border bg-card py-2.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pause className="size-4" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Pause
          </span>
        </button>
        <button
          type="button"
          className="flex flex-1 flex-col items-center gap-1 rounded-lg border border-border bg-card py-2.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Pencil className="size-4" />
          <span className="text-[10px] font-semibold uppercase tracking-wide">
            Edit
          </span>
        </button>
      </div>
    </div>
  );
}
