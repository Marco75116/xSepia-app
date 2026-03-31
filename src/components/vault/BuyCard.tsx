"use client";

import { Loader2, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/eden";

type Composition = {
  ticker: string;
  tokenAddress: string;
  weight: number;
};

export function BuyCard({
  smartAccountAddress,
  compositions,
}: {
  smartAccountAddress: string;
  compositions: Composition[];
}) {
  const [amount, setAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [result, setResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const parsedAmount = Number.parseFloat(amount);
  const isValid = !Number.isNaN(parsedAmount) && parsedAmount >= 10;

  async function handleBuy() {
    if (!isValid) return;

    setBuying(true);
    setResult(null);

    const totalUsdc = parsedAmount * 1e6;
    let successCount = 0;

    for (const comp of compositions) {
      const sellAmount = Math.floor((totalUsdc * comp.weight) / 100);
      if (sellAmount < 10_000_000) continue;

      const { error } = await api.swap.post({
        userAccountAddress: smartAccountAddress,
        buyToken: comp.tokenAddress,
        sellAmount: String(sellAmount),
      });

      if (!error) {
        successCount++;
      }
    }

    setBuying(false);

    if (successCount > 0) {
      setResult({
        type: "success",
        message: `${successCount} order${successCount > 1 ? "s" : ""} submitted`,
      });
      setAmount("");
    } else {
      setResult({
        type: "error",
        message: "Failed to submit orders. Check balance and try again.",
      });
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Buy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
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
          <Button
            className="gap-1.5 shrink-0"
            disabled={!isValid || buying}
            onClick={handleBuy}
          >
            {buying ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
            Buy
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Min. $10 USDC. Split across holdings by weight.
        </p>
        {result && (
          <p
            className={`text-sm font-medium ${result.type === "success" ? "text-positive" : "text-destructive"}`}
          >
            {result.message}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
