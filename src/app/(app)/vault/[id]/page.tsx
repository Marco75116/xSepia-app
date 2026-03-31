"use client";

import { ArrowLeft, Pause, Pencil, PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ContentLayout } from "@/components/ContentLayout";
import { StockLogo } from "@/components/StockLogo";
import { Card, CardContent } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { getStockByTicker, getVaultById } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

const chartConfig: ChartConfig = {
  totalValue: {
    label: "Vault Value",
    color: "hsl(142 76% 36%)",
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
    <ContentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-sm font-semibold">{vault.name}</h1>
            <span className="rounded bg-positive/10 px-2 py-0.5 font-mono text-[10px] font-medium text-positive uppercase">
              {vault.status}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <PlusCircle className="size-3.5" />
              Add Funds
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pause className="size-3.5" />
              Pause
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="space-y-1">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Total Vault Value
              </p>
              <div className="flex items-baseline gap-3">
                <p className="font-mono text-3xl font-bold tracking-tight">
                  {formatCurrency(vault.totalValue)}
                </p>
                <span className="font-mono text-xs font-medium text-positive">
                  +{formatCurrency(vault.totalGainAmount)} · +
                  {vault.totalGainPercent.toFixed(1)}% all time
                </span>
              </div>
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  30 Day Performance
                </p>
                <span className="rounded bg-positive/10 px-2 py-0.5 font-mono text-[10px] font-medium text-positive">
                  Outperforming SPY by {vault.benchmarkDelta}%
                </span>
              </div>

              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <AreaChart
                  data={vault.performanceHistory}
                  margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="vaultFill" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="hsl(142 76% 36%)"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="100%"
                        stopColor="hsl(142 76% 36%)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val: string) => {
                      const d = new Date(val);
                      return `${d.toLocaleString("en", { month: "short" })} ${d.getDate()}`;
                    }}
                    tick={{ fontSize: 10 }}
                    className="fill-muted-foreground"
                    interval="preserveStartEnd"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalValue"
                    stroke="hsl(142 76% 36%)"
                    strokeWidth={1.5}
                    fill="url(#vaultFill)"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                Holdings
              </p>
              {vault.allocations.map((alloc) => {
                const stock = getStockByTicker(alloc.ticker);
                return (
                  <Card key={alloc.ticker}>
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

            <Card>
              <CardContent className="flex items-start gap-2.5 p-3.5">
                <div className="mt-0.5 rounded bg-positive/10 p-1.5">
                  <RefreshCw className="size-3.5 text-positive" />
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
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
