"use client";

import { ArrowRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { WizardAction, WizardState } from "@/app/(app)/vault/new/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { BasketTemplateCard } from "@/components/vault-wizard/BasketTemplateCard";
import { StockCard } from "@/components/vault-wizard/StockCard";
import { BASKETS, STOCKS } from "@/lib/data";

const SECTORS = ["All", ...new Set(STOCKS.map((s) => s.sector))] as const;

export function StockSelectionStep({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  const [search, setSearch] = useState("");
  const [sectorFilter, setSectorFilter] = useState("All");

  const filteredStocks = useMemo(() => {
    return STOCKS.filter((stock) => {
      const matchesSearch =
        search === "" ||
        stock.ticker.toLowerCase().includes(search.toLowerCase()) ||
        stock.name.toLowerCase().includes(search.toLowerCase());
      const matchesSector =
        sectorFilter === "All" || stock.sector === sectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [search, sectorFilter]);

  const isBasketSelected = (basketId: string) => {
    const basket = BASKETS.find((b) => b.id === basketId);
    if (!basket) return false;
    const basketTickers = basket.allocations.map((a) => a.ticker).sort();
    const selectedSorted = [...state.selectedTickers].sort();
    return (
      basketTickers.length === selectedSorted.length &&
      basketTickers.every((t, i) => t === selectedSorted[i])
    );
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Quick Start</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {BASKETS.map((basket) => (
            <BasketTemplateCard
              key={basket.id}
              basket={basket}
              selected={isBasketSelected(basket.id)}
              onApply={() =>
                dispatch({ type: "APPLY_BASKET", basketId: basket.id })
              }
            />
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search stocks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {SECTORS.map((sector) => (
            <Badge
              key={sector}
              variant={sectorFilter === sector ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSectorFilter(sector)}
            >
              {sector}
            </Badge>
          ))}
        </div>

        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredStocks.map((stock, i) => (
            <StockCard
              key={stock.ticker}
              stock={stock}
              selected={state.selectedTickers.includes(stock.ticker)}
              onToggle={() =>
                dispatch({ type: "TOGGLE_STOCK", ticker: stock.ticker })
              }
              index={i}
            />
          ))}
        </div>

        {filteredStocks.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No stocks match your search
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => dispatch({ type: "NEXT_STEP" })}
          disabled={state.selectedTickers.length === 0}
          className="gap-2"
        >
          Continue to Allocation
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
