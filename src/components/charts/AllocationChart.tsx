"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getStockByTicker, PORTFOLIO_HOLDINGS } from "@/lib/data";

function getAllocationData() {
  const data = PORTFOLIO_HOLDINGS.map((h) => {
    const stock = getStockByTicker(h.ticker);
    return {
      name: stock?.name ?? h.ticker,
      ticker: h.ticker,
      value: h.shares * (stock?.price ?? 0),
      color: stock?.color ?? "#666",
    };
  }).sort((a, b) => b.value - a.value);

  return data;
}

export function AllocationChart() {
  const data = getAllocationData();

  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((d) => [d.ticker, { label: d.name, color: d.color }]),
  );

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[300px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={110}
          strokeWidth={2}
          stroke="oklch(0.13 0.005 260)"
        >
          {data.map((entry) => (
            <Cell key={entry.ticker} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
