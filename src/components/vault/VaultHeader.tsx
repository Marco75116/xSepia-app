"use client";

import { CircleDollarSign, Wallet } from "lucide-react";
import { useReadContracts } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { erc20Abi } from "@/lib/abis/erc20";
import { getChainConfig } from "@/lib/constants";
import { getStockByTicker } from "@/lib/data";
import { formatCurrency } from "@/lib/formatters";

type Composition = {
  ticker: string;
  tokenAddress: string;
  weight: number;
};

function StatCard({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-muted p-2">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

export function VaultHeader({
  smartAccountAddress,
  compositions,
  chainId,
}: {
  smartAccountAddress: string;
  compositions: Composition[];
  chainId: number;
}) {
  const chainConfig = getChainConfig(chainId);
  const account = smartAccountAddress as `0x${string}`;

  const contracts = [
    {
      address: chainConfig.usdc,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
      chainId: chainConfig.chainId,
    },
    ...compositions.map((comp) => ({
      address: comp.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
      chainId: chainConfig.chainId,
    })),
  ];

  const { data, isLoading } = useReadContracts({ contracts });

  const usdcBalance =
    data?.[0]?.status === "success" ? Number(data[0].result) / 1e6 : 0;

  let stockValue = 0;
  if (data) {
    for (let i = 0; i < compositions.length; i++) {
      const result = data[i + 1];
      if (result?.status === "success") {
        const stock = getStockByTicker(compositions[i].ticker);
        const balance = Number(result.result) / 1e18;
        stockValue += balance * (stock?.price ?? 0);
      }
    }
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      <StatCard icon={Wallet} label="USDC Available">
        {isLoading ? (
          <Skeleton className="mt-0.5 h-5 w-20" />
        ) : (
          <p className="font-mono text-sm font-semibold">
            {formatCurrency(usdcBalance)}
          </p>
        )}
      </StatCard>

      <StatCard icon={CircleDollarSign} label="Invested">
        {isLoading ? (
          <Skeleton className="mt-0.5 h-5 w-20" />
        ) : (
          <p className="font-mono text-sm font-semibold">
            {formatCurrency(stockValue)}
          </p>
        )}
      </StatCard>
    </div>
  );
}
