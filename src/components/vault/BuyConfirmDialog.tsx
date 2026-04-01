"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { StockLogo } from "@/components/StockLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { getStockByTicker } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

type Composition = {
  ticker: string;
  tokenAddress: string;
  weight: number;
};

type OrderLine = {
  ticker: string;
  weight: number;
  usdcAmount: number;
  skipped: boolean;
};

function buildOrderLines(
  totalUsdc: number,
  compositions: Composition[],
): OrderLine[] {
  return compositions.map((comp) => {
    const amount = Math.floor((totalUsdc * comp.weight) / 100) / 1e6;
    return {
      ticker: comp.ticker,
      weight: comp.weight,
      usdcAmount: amount,
      skipped: amount < 10,
    };
  });
}

export function BuyConfirmDialog({
  open,
  onOpenChange,
  amount,
  compositions,
  buying,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  compositions: Composition[];
  buying: boolean;
  onConfirm: () => void;
}) {
  const totalUsdc = amount * 1e6;
  const lines = buildOrderLines(totalUsdc, compositions);
  const activeLines = lines.filter((l) => !l.skipped);
  const skippedLines = lines.filter((l) => l.skipped);

  return (
    <Dialog open={open} onOpenChange={buying ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Buy Order</DialogTitle>
          <DialogDescription>
            {formatCurrency(amount)} USDC will be split across{" "}
            {activeLines.length} asset{activeLines.length > 1 ? "s" : ""}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1">
          {activeLines.map((line, i) => {
            const stock = getStockByTicker(line.ticker);
            return (
              <div key={line.ticker}>
                {i > 0 && <Separator />}
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2.5">
                    <StockLogo
                      ticker={line.ticker}
                      color={stock?.color ?? "#666"}
                      logo={stock?.logo}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {stock?.name ?? line.ticker}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {line.weight}%
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-sm font-semibold">
                    {formatCurrency(line.usdcAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {skippedLines.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {skippedLines.map((l) => l.ticker).join(", ")} skipped (below $10
            minimum).
          </p>
        )}

        <Separator />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Total</span>
          <span className="font-mono text-sm font-bold">
            {formatCurrency(amount)}
          </span>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={buying}
          >
            Cancel
          </Button>
          <Button className="gap-1.5" onClick={onConfirm} disabled={buying}>
            {buying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            {buying ? "Submitting..." : "Confirm Buy"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
