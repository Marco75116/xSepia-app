"use client";

import { Wallet } from "lucide-react";
import { useReadContract } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { erc20Abi } from "@/lib/abis/erc20";
import { INK_CHAIN_ID, USDC_ADDRESS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

export function UsdcBalanceCard({
  smartAccountAddress,
}: {
  smartAccountAddress: string;
}) {
  const { data: balance, isLoading } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [smartAccountAddress as `0x${string}`],
    chainId: INK_CHAIN_ID,
  });

  const formatted = balance !== undefined ? Number(balance) / 1e6 : 0;

  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-primary/10 p-2">
          <Wallet className="size-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">
            USDC Balance
          </p>
          {isLoading ? (
            <Skeleton className="mt-1 h-6 w-24" />
          ) : (
            <p className="font-mono text-lg font-bold">
              {formatCurrency(formatted)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
