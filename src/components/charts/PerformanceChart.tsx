"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { PORTFOLIO_HISTORY } from "@/lib/data";

const chartConfig: ChartConfig = {
  totalValue: {
    label: "Portfolio Value",
    color: "oklch(0.72 0.19 163)",
  },
};

export function PerformanceChart() {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart
        data={PORTFOLIO_HISTORY}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <defs>
          <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="oklch(0.72 0.19 163)"
              stopOpacity={0.3}
            />
            <stop
              offset="100%"
              stopColor="oklch(0.72 0.19 163)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="oklch(1 0 0 / 8%)"
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickFormatter={(val: string) => {
            const d = new Date(val);
            return `${d.getMonth() + 1}/${d.getDate()}`;
          }}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11 }}
          width={50}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          type="monotone"
          dataKey="totalValue"
          stroke="oklch(0.72 0.19 163)"
          strokeWidth={2}
          fill="url(#fillValue)"
        />
      </AreaChart>
    </ChartContainer>
  );
}
