"use client";

import { useMemo } from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getStockByTicker } from "@/lib/data";

export function AllocationPieChart({
  allocations,
}: {
  allocations: { ticker: string; weight: number }[];
}) {
  const { chartData, chartConfig, total } = useMemo(() => {
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

    const sum = data.reduce((acc, d) => acc + d.weight, 0);

    return { chartData: data, chartConfig: config, total: sum };
  }, [allocations]);

  if (chartData.length === 0) {
    return (
      <div className="mx-auto flex aspect-square max-h-[200px] items-center justify-center">
        <div className="size-[120px] rounded-full border-4 border-dashed border-muted" />
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[200px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="weight"
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
                      className="fill-foreground text-2xl font-bold"
                    >
                      {total}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      Allocated
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
