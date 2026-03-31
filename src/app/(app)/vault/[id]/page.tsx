"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ContentLayout } from "@/components/ContentLayout";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyCard } from "@/components/vault/BuyCard";
import { UsdcBalanceCard } from "@/components/vault/UsdcBalanceCard";
import { getStockByTicker } from "@/lib/data";
import { api } from "@/lib/eden";
import { formatAddress, formatDate } from "@/lib/formatters";

type VaultData = {
  vault: {
    id: string;
    name: string;
    owner: string;
    smartAccountAddress: string | null;
    strategy: string;
    dcaFrequency: string | null;
    dcaAmount: string | null;
    createdAt: string;
  };
  compositions: {
    ticker: string;
    tokenAddress: string;
    weight: number;
  }[];
};

export default function VaultDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<VaultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchVault() {
      const { data: result, error: apiError } = await api.vault({ id }).get();

      if (apiError || !result) {
        setError(true);
        setLoading(false);
        return;
      }

      setData(result as VaultData);
      setLoading(false);
    }

    fetchVault();
  }, [id]);

  if (error) {
    notFound();
  }

  if (loading || !data) {
    return (
      <ContentLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <Skeleton className="h-7 w-48" />
          </div>
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        </div>
      </ContentLayout>
    );
  }

  const { vault, compositions } = data;

  return (
    <ContentLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="size-4" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold">{vault.name}</h1>
            <Badge variant="secondary" className="font-mono uppercase">
              {vault.strategy}
            </Badge>
          </div>
        </div>

        <div className="flex h-1.5 gap-px overflow-hidden rounded-full">
          {compositions.map((comp) => {
            const stock = getStockByTicker(comp.ticker);
            return (
              <div
                key={comp.ticker}
                className="h-full"
                style={{
                  width: `${comp.weight}%`,
                  backgroundColor: stock?.color ?? "#666",
                }}
              />
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Holdings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {compositions.map((comp) => {
                  const stock = getStockByTicker(comp.ticker);
                  return (
                    <div
                      key={comp.ticker}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <StockLogo
                          ticker={comp.ticker}
                          color={stock?.color ?? "#666"}
                          logo={stock?.logo}
                          size="sm"
                        />
                        <div>
                          <p className="text-sm font-medium">
                            {stock?.name ?? comp.ticker}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {comp.ticker}
                          </p>
                        </div>
                      </div>
                      <p className="font-mono text-sm font-semibold">
                        {comp.weight}%
                      </p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Strategy</span>
                  <span className="font-medium capitalize">
                    {vault.strategy === "dca" ? "Automatic DCA" : "Manual"}
                  </span>
                </div>
                {vault.dcaFrequency && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Frequency</span>
                    <span className="font-medium capitalize">
                      {vault.dcaFrequency}
                    </span>
                  </div>
                )}
                {vault.dcaAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">DCA Amount</span>
                    <span className="font-mono font-medium">
                      ${vault.dcaAmount}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Owner</span>
                  <span className="font-mono font-medium">
                    {formatAddress(vault.owner)}
                  </span>
                </div>
                {vault.smartAccountAddress && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Smart Account</span>
                    <span className="font-mono font-medium">
                      {formatAddress(vault.smartAccountAddress)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created</span>
                  <span className="font-medium">
                    {formatDate(vault.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {vault.smartAccountAddress && (
              <>
                <UsdcBalanceCard
                  smartAccountAddress={vault.smartAccountAddress}
                />
                <BuyCard
                  smartAccountAddress={vault.smartAccountAddress}
                  compositions={compositions}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
