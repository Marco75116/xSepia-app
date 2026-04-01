"use client";

import { CircleDollarSign, Layers, TrendingUp, Wallet } from "lucide-react";
import { useReadContracts } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { FundDialog } from "@/components/vault/FundDialog";
import { erc20Abi } from "@/lib/abis/erc20";
import { INK_CHAIN_ID, USDC_ADDRESS } from "@/lib/constants";
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
  strategy,
  dcaFrequency,
}: {
  smartAccountAddress: string;
  compositions: Composition[];
  strategy: string;
  dcaFrequency: string | null;
}) {
  const account = smartAccountAddress as `0x${string}`;

  const contracts = [
    {
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
      chainId: INK_CHAIN_ID,
    },
    ...compositions.map((comp) => ({
      address: comp.tokenAddress as `0x${string}`,
      abi: erc20Abi,
      functionName: "balanceOf" as const,
      args: [account],
      chainId: INK_CHAIN_ID,
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

  const totalValue = usdcBalance + stockValue;

  const strategyLabel =
    strategy === "dca"
      ? `DCA ${dcaFrequency ? `\u00B7 ${dcaFrequency}` : ""}`
      : "Manual";

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm font-medium text-muted-foreground">
          Total Vault Value
        </p>
        {isLoading ? (
          <Skeleton className="h-10 w-48" />
        ) : (
          <p className="font-mono text-4xl font-bold tracking-tight">
            {formatCurrency(totalValue)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Wallet} label="USDC Available">
          {isLoading ? (
            <Skeleton className="mt-0.5 h-5 w-20" />
          ) : (
            <div className="flex items-center gap-1.5">
              <p className="font-mono text-sm font-semibold">
                {formatCurrency(usdcBalance)}
              </p>
              <FundDialog smartAccountAddress={smartAccountAddress} />
            </div>
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

        <StatCard
          icon={strategy === "dca" ? TrendingUp : Layers}
          label="Strategy"
        >
          <p className="text-sm font-semibold capitalize">{strategyLabel}</p>
        </StatCard>
      </div>
    </div>
  );
}
