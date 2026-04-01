"use client";

import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import { useReadContracts } from "wagmi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { erc20Abi } from "@/lib/abis/erc20";
import { getChainConfig } from "@/lib/constants";
import { getStockByTicker } from "@/lib/data";
import { formatCompactCurrency, formatCurrency } from "@/lib/formatters";

type Composition = {
  ticker: string;
  tokenAddress: string;
  weight: number;
};

export function VaultValueChart({
  smartAccountAddress,
  compositions,
  chainId,
}: {
  smartAccountAddress: string;
  compositions: Composition[];
  chainId: number;
}) {
  const chainConfig = getChainConfig(chainId);
  const account = smartAccountAddress as `0x${string}`;

  const contracts = [
    {
      address: chainConfig.usdc,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
      chainId: chainConfig.chainId,
    },
    ...compositions.map((comp) => ({
      address: comp.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
      chainId: chainConfig.chainId,
    })),
  ];

  const { data, isLoading } = useReadContracts({ contracts });

  const { chartData, chartConfig, totalValue, tableData } = useMemo(() => {
    const usdcBal =
      data?.[0]?.status === "success" ? Number(data[0].result) / 1e6 : 0;

    const items: {
      ticker: string;
      name: string;
      value: number;
      balance: number;
      color: string;
      weight: number;
    }[] = [];

    for (let i = 0; i < compositions.length; i++) {
      const comp = compositions[i];
      const stock = getStockByTicker(comp.ticker);
      const result = data?.[i + 1];
      const balance =
        result?.status === "success" ? Number(result.result) / 1e18 : 0;
      const value = balance * (stock?.price ?? 0);
      items.push({
        ticker: comp.ticker,
        name: stock?.name ?? comp.ticker,
        value,
        balance,
        color: stock?.color ?? "#666",
        weight: comp.weight,
      });
    }

    if (usdcBal > 0) {
      items.unshift({
        ticker: "USDC",
        name: "USDC",
        value: usdcBal,
        balance: usdcBal,
        color: "#2775CA",
        weight: 0,
      });
    }

    const total = items.reduce((acc, item) => acc + item.value, 0);
    const hasValues = total > 0;

    const pieData = hasValues
      ? items
          .filter((item) => item.value > 0)
          .map((item) => ({
            ticker: item.ticker,
            value: item.value,
            fill: `var(--color-${item.ticker})`,
          }))
      : compositions
          .filter((c) => c.weight > 0)
          .map((comp) => ({
            ticker: comp.ticker,
            value: comp.weight,
            fill: `var(--color-${comp.ticker})`,
          }));

    const config: ChartConfig = {
      value: { label: "Value" },
      USDC: { label: "USDC", color: "#2775CA" },
      ...Object.fromEntries(
        compositions.map((comp) => {
          const stock = getStockByTicker(comp.ticker);
          return [
            comp.ticker,
            {
              label: stock?.name ?? comp.ticker,
              color: stock?.color ?? "#666",
            },
          ];
        }),
      ),
    };

    const tData = items
      .sort((a, b) => b.value - a.value)
      .map((item) => ({
        ...item,
        share: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0",
      }));

    return {
      chartData: pieData,
      chartConfig: config,
      totalValue: total,
      tableData: tData,
    };
  }, [data, compositions]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vault Value
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Skeleton className="size-[180px] shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Vault Value
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-6">
          <ChartContainer
            config={chartConfig}
            className="aspect-square w-[200px] shrink-0"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value, name) => (
                      <>
                        <div
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{
                            backgroundColor: `var(--color-${name})`,
                          }}
                        />
                        <span className="text-muted-foreground">
                          {chartConfig[name as string]?.label ?? name}
                        </span>
                        <span className="ml-auto font-mono font-medium tabular-nums text-foreground">
                          {formatCurrency(value as number)}
                        </span>
                      </>
                    )}
                  />
                }
              />
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="ticker"
                innerRadius={55}
                strokeWidth={4}
              >
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="fill-foreground text-xl font-bold"
                          >
                            {formatCompactCurrency(totalValue)}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 18}
                            className="fill-muted-foreground text-xs"
                          >
                            Total Value
                          </tspan>
                        </text>
                      );
                    }
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="flex-1 space-y-1.5">
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 border-b pb-1.5 text-xs text-muted-foreground">
              <span>Asset</span>
              <span>Value</span>
              <span>Share</span>
            </div>
            {tableData.map((item) => {
              const hasBalance = item.balance > 0;
              return (
                <div
                  key={item.ticker}
                  className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium">
                          {item.name}
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {item.ticker}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">
                        {hasBalance
                          ? `${item.balance < 0.0001 ? item.balance.toExponential(2) : item.balance.toFixed(4)} tokens`
                          : "No balance"}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs">
                    {hasBalance ? formatCurrency(item.value) : "\u2014"}
                  </span>
                  <span className="text-right text-xs">
                    {hasBalance ? `${item.share}%` : "\u2014"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
