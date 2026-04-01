"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { StockLogo } from "@/components/StockLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getStockByTicker } from "@/lib/data";
import { api } from "@/lib/eden";
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

export function BuyDialog({
  vaultId,
  smartAccountAddress,
  compositions,
}: {
  vaultId: string;
  smartAccountAddress: string;
  compositions: Composition[];
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const parsedAmount = Number.parseFloat(amount);
  const isValid = !Number.isNaN(parsedAmount) && parsedAmount >= 10;

  const totalUsdc = (parsedAmount || 0) * 1e6;
  const lines = isValid ? buildOrderLines(totalUsdc, compositions) : [];
  const activeLines = lines.filter((l) => !l.skipped);
  const skippedLines = lines.filter((l) => l.skipped);

  async function handleConfirm() {
    if (!isValid) return;
    setBuying(true);

    const orders = compositions
      .map((comp) => ({
        buyToken: comp.tokenAddress,
        sellAmount: String(Math.floor((totalUsdc * comp.weight) / 100)),
      }))
      .filter((o) => BigInt(o.sellAmount) >= BigInt(10_000_000));

    if (orders.length === 0) {
      setBuying(false);
      setResult({
        type: "error",
        message: "All allocations are below $10 minimum.",
      });
      return;
    }

    const { data, error } = await api.swap.post({
      userAccountAddress: smartAccountAddress,
      vaultId,
      orders,
    });

    setBuying(false);

    if (error) {
      setResult({
        type: "error",
        message: "Failed to submit orders. Check balance and try again.",
      });
      return;
    }

    const successCount = data.results.filter((r) => r.orderUid).length;
    const failCount = data.results.filter((r) => r.error).length;

    if (successCount > 0 && failCount === 0) {
      setResult({
        type: "success",
        message: `${successCount} order${successCount > 1 ? "s" : ""} submitted`,
      });
      setAmount("");
    } else if (successCount > 0) {
      setResult({
        type: "success",
        message: `${successCount} submitted, ${failCount} failed`,
      });
      setAmount("");
    } else {
      setResult({
        type: "error",
        message: "Failed to submit orders. Check balance and try again.",
      });
    }
  }

  function handleOpenChange(next: boolean) {
    if (buying) return;
    setOpen(next);
    if (!next) {
      setAmount("");
      setResult(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-3.5" />
          Buy
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Confirm Buy Order</DialogTitle>
          <DialogDescription>
            {isValid
              ? `${formatCurrency(parsedAmount)} USDC will be split across ${activeLines.length} asset${activeLines.length > 1 ? "s" : ""}.`
              : "Enter an amount to split across holdings by weight."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Input
            type="text"
            inputMode="decimal"
            placeholder="USDC amount"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value.replace(/[^0-9.]/g, ""));
              setResult(null);
            }}
            className="font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={buying}
          />
          <p className="text-xs text-muted-foreground">Min. $10 USDC</p>
        </div>

        {isValid && activeLines.length > 0 && (
          <>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Preview
            </p>
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
                {skippedLines.map((l) => l.ticker).join(", ")} skipped (below
                $10 minimum).
              </p>
            )}
          </>
        )}

        {result && (
          <p
            className={`text-sm font-medium ${result.type === "success" ? "text-positive" : "text-destructive"}`}
          >
            {result.message}
          </p>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={buying}
          >
            Cancel
          </Button>
          <Button
            className="gap-1.5"
            onClick={handleConfirm}
            disabled={!isValid || buying}
          >
            {buying && <Loader2 className="size-4 animate-spin" />}
            {buying ? "Submitting..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
