"use client";

import { useReadContracts } from "wagmi";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

export function HoldingsCard({
  smartAccountAddress,
  compositions,
  chainId,
}: {
  smartAccountAddress: string | null;
  compositions: Composition[];
  chainId: number;
}) {
  const chainConfig = getChainConfig(chainId);
  const account = smartAccountAddress as `0x${string}` | undefined;

  const contracts = account
    ? compositions.map((comp) => ({
        address: comp.tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "balanceOf" as const,
        args: [account],
        chainId: chainConfig.chainId,
      }))
    : [];

  const { data, isLoading } = useReadContracts({
    contracts,
    query: { enabled: !!account },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Holdings</CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        {compositions.map((comp, i) => {
          const stock = getStockByTicker(comp.ticker);
          const result = data?.[i];
          const balance =
            result?.status === "success" ? Number(result.result) / 1e18 : 0;
          const value = balance * (stock?.price ?? 0);
          const hasBalance = balance > 0;

          return (
            <div key={comp.ticker}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                  <StockLogo
                    ticker={comp.ticker}
                    color={stock?.color ?? "#666"}
                    logo={stock?.logo}
                    size="md"
                  />
                  <div>
                    <p className="text-sm font-semibold">
                      {stock?.name ?? comp.ticker}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {comp.ticker}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    {isLoading ? (
                      <>
                        <Skeleton className="ml-auto h-4 w-16" />
                        <Skeleton className="ml-auto mt-1 h-3 w-12" />
                      </>
                    ) : (
                      <>
                        <p className="font-mono text-sm font-medium">
                          {hasBalance ? formatCurrency(value) : "\u2014"}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {hasBalance
                            ? `${balance < 0.0001 ? balance.toExponential(2) : balance.toFixed(4)} tokens`
                            : "No balance"}
                        </p>
                      </>
                    )}
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {comp.weight}%
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
