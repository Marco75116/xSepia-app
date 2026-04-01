"use client";

import { TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { Pie, PieChart } from "recharts";
import type { WizardState } from "@/app/(app)/vault/new/page";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { type ChartConfig, ChartContainer } from "@/components/ui/chart";
import { Separator } from "@/components/ui/separator";
import { getStockByTicker } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

const strategyLabels: Record<WizardState["strategy"], string> = {
  manual: "Manual",
  dca: "Automatic DCA",
};

const frequencyLabels: Record<WizardState["dcaFrequency"], string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
};

const actionLabels: Record<string, string> = {
  rebalance: "Change Allocation",
  buy: "Buy Asset",
  exit: "Exit to Cash",
  pause: "Pause Buying",
};

export function VaultReviewCard({ state }: { state: WizardState }) {
  const allocations = state.selectedTickers.map((ticker) => ({
    ticker,
    weight: state.allocations[ticker] ?? 0,
  }));

  const { chartData, chartConfig } = useMemo(() => {
    const data = allocations
      .filter((a) => a.weight > 0)
      .map((alloc) => {
        const stock = getStockByTicker(alloc.ticker);
        return {
          name: stock?.name ?? alloc.ticker,
          ticker: alloc.ticker,
          weight: alloc.weight,
          fill: `var(--color-${alloc.ticker})`,
        };
      });

    const config: ChartConfig = {
      weight: { label: "Weight" },
      ...Object.fromEntries(
        data.map((d) => {
          const stock = getStockByTicker(d.ticker);
          return [d.ticker, { label: d.name, color: stock?.color ?? "#666" }];
        }),
      ),
    };

    return { chartData: data, chartConfig: config };
  }, [allocations]);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <CardTitle className="text-base">Review</CardTitle>

        <div className="flex items-start gap-4">
          {chartData.length > 0 && (
            <div className="shrink-0">
              <ChartContainer
                config={chartConfig}
                className="aspect-square h-[100px]"
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="weight"
                    nameKey="ticker"
                    innerRadius={28}
                    strokeWidth={3}
                  />
                </PieChart>
              </ChartContainer>
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            {state.vaultName && (
              <p className="text-sm font-semibold">{state.vaultName}</p>
            )}
            <div className="space-y-1.5">
              {allocations.map((alloc) => {
                const stock = getStockByTicker(alloc.ticker);
                if (!stock) return null;
                return (
                  <div
                    key={alloc.ticker}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <StockLogo
                        ticker={stock.ticker}
                        color={stock.color}
                        logo={stock.logo}
                        size="sm"
                      />
                      <span className="text-sm">{stock.ticker}</span>
                    </div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {alloc.weight}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Strategy</span>
            <span className="font-medium">
              {strategyLabels[state.strategy]}
            </span>
          </div>
          {state.strategy !== "manual" && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="font-mono font-medium">
                {formatCurrency(state.amount)}
              </span>
            </div>
          )}
          {state.strategy === "dca" && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Frequency</span>
              <span className="font-medium">
                {frequencyLabels[state.dcaFrequency]}
              </span>
            </div>
          )}
        </div>

        {state.signal && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded bg-primary/10 text-primary">
                  <TrendingUp className="size-3.5" />
                </div>
                <span className="text-sm font-semibold">Signal</span>
              </div>
              <p className="text-sm text-muted-foreground leading-snug">
                {state.signal.question}
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[10px]">
                  Threshold: {state.signalThreshold}%
                </Badge>
                {state.signalAction && (
                  <Badge variant="outline" className="text-[10px]">
                    {actionLabels[state.signalAction]}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
