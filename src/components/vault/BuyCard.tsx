"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { BuyConfirmDialog } from "@/components/vault/BuyConfirmDialog";
import { api } from "@/lib/eden";

type Composition = {
  ticker: string;
  tokenAddress: string;
  weight: number;
};

export function BuyCard({
  vaultId,
  smartAccountAddress,
  compositions,
  chainId,
}: {
  vaultId: string;
  smartAccountAddress: string;
  compositions: Composition[];
  chainId: number;
}) {
  const [amount, setAmount] = useState("");
  const [buying, setBuying] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const parsedAmount = Number.parseFloat(amount);
  const isValid = !Number.isNaN(parsedAmount) && parsedAmount >= 10;

  function handleBuyClick() {
    if (!isValid) return;
    setConfirmOpen(true);
  }

  async function handleConfirm() {
    setBuying(true);

    const totalUsdc = parsedAmount * 1e6;

    const orders = compositions
      .map((comp) => ({
        buyToken: comp.tokenAddress,
        sellAmount: String(Math.floor((totalUsdc * comp.weight) / 100)),
      }))
      .filter((o) => BigInt(o.sellAmount) >= BigInt(10_000_000));

    if (orders.length === 0) {
      setBuying(false);
      toast.error("All allocations are below $10 minimum.");
      return;
    }

    const { data, error } = await api.swap.post({
      userAccountAddress: smartAccountAddress,
      vaultId,
      chainId,
      orders,
    });

    setBuying(false);
    setConfirmOpen(false);

    if (error) {
      toast.error("Failed to submit orders. Check balance and try again.");
      return;
    }

    const successCount = data.results.filter((r) => r.orderUid).length;
    const failCount = data.results.filter((r) => r.error).length;

    if (successCount > 0 && failCount === 0) {
      toast.success(
        `${successCount} order${successCount > 1 ? "s" : ""} submitted`,
      );
      setAmount("");
    } else if (successCount > 0) {
      toast.success(`${successCount} submitted, ${failCount} failed`);
      setAmount("");
    } else {
      toast.error("Failed to submit orders. Check balance and try again.");
    }
  }

  return (
    <>
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
              }}
              className="font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={buying}
            />
            <Button
              className="gap-1.5 shrink-0"
              disabled={!isValid || buying}
              onClick={handleBuyClick}
            >
              <ShoppingCart className="size-4" />
              Buy
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Min. $10 USDC. Split across holdings by weight.
          </p>
        </CardContent>
      </Card>

      <BuyConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        amount={parsedAmount || 0}
        compositions={compositions}
        buying={buying}
        onConfirm={handleConfirm}
      />
    </>
  );
}
