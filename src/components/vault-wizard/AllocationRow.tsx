"use client";

import { StockLogo } from "@/components/StockLogo";
import { Slider } from "@/components/ui/slider";
import type { Stock } from "@/lib/data";

export function AllocationRow({
  stock,
  weight,
  onChange,
}: {
  stock: Stock;
  weight: number;
  onChange: (weight: number) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 w-24 shrink-0">
        <StockLogo
          ticker={stock.ticker}
          color={stock.color}
          logo={stock.logo}
          size="sm"
        />
        <span className="text-sm font-medium">{stock.ticker}</span>
      </div>
      <Slider
        value={[weight]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={100}
        step={1}
        className="min-w-24 flex-1"
      />
      <div className="flex items-center shrink-0">
        <input
          type="number"
          value={weight}
          onChange={(e) => {
            const v = Number.parseInt(e.target.value, 10);
            if (!Number.isNaN(v) && v >= 0 && v <= 100) onChange(v);
          }}
          className="w-8 bg-transparent text-right font-mono text-sm font-medium outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
          min={0}
          max={100}
        />
        <span className="text-xs text-muted-foreground">%</span>
      </div>
    </div>
  );
}
