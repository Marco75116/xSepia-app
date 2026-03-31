"use client";

import { ArrowRight, SlidersHorizontal } from "lucide-react";
import type { WizardAction, WizardState } from "@/app/(app)/vault/new/page";
import { Button } from "@/components/ui/button";
import { AllocationPieChart } from "@/components/vault-wizard/AllocationPieChart";
import { AllocationRow } from "@/components/vault-wizard/AllocationRow";
import { getStockByTicker } from "@/lib/data";
import { cn } from "@/lib/utils";

export function AllocationStep({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  const allocations = state.selectedTickers.map((ticker) => ({
    ticker,
    weight: state.allocations[ticker] ?? 0,
  }));

  const total = allocations.reduce((sum, a) => sum + a.weight, 0);
  const isValid = total === 100;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4">
      <div className="flex flex-col items-center gap-3">
        <AllocationPieChart allocations={allocations} />
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "font-mono text-sm font-medium",
              isValid ? "text-foreground" : "text-destructive",
            )}
          >
            {total}% / 100%
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => dispatch({ type: "EQUALIZE_ALLOCATIONS" })}
          >
            <SlidersHorizontal className="size-3.5" />
            Equalize
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {state.selectedTickers.map((ticker) => {
          const stock = getStockByTicker(ticker);
          if (!stock) return null;
          return (
            <AllocationRow
              key={ticker}
              stock={stock}
              weight={state.allocations[ticker] ?? 0}
              onChange={(weight) =>
                dispatch({ type: "SET_ALLOCATION", ticker, weight })
              }
            />
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          disabled={!isValid}
          className="gap-2"
        >
          Continue to Strategy
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
