"use client";

import { ArrowLeft, Calendar, Loader2, User, Vault } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ContentLayout } from "@/components/ContentLayout";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyCard } from "@/components/vault/BuyCard";
import { VaultHeader } from "@/components/vault/VaultHeader";
import { getStockByTicker } from "@/lib/data";
import { api } from "@/lib/eden";
import { formatAddress, formatCurrency, formatDate } from "@/lib/formatters";

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

        {vault.smartAccountAddress && (
          <VaultHeader
            smartAccountAddress={vault.smartAccountAddress}
            compositions={compositions}
            strategy={vault.strategy}
            dcaFrequency={vault.dcaFrequency}
          />
        )}

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
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">
                  Holdings
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {compositions.map((comp, i) => {
                  const stock = getStockByTicker(comp.ticker);
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
                          {stock && (
                            <div className="text-right">
                              <p className="font-mono text-sm font-medium">
                                {formatCurrency(stock.price)}
                              </p>
                              <p
                                className={`text-xs font-mono ${stock.change24h >= 0 ? "text-positive" : "text-destructive"}`}
                              >
                                {stock.change24h >= 0 ? "+" : ""}
                                {stock.change24h.toFixed(2)}%
                              </p>
                            </div>
                          )}
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

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="size-3.5" />
                    <span>Owner</span>
                  </div>
                  <span className="font-mono font-medium">
                    {formatAddress(vault.owner)}
                  </span>
                </div>
                {vault.smartAccountAddress && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Vault className="size-3.5" />
                      <span>Smart Account</span>
                    </div>
                    <span className="font-mono font-medium">
                      {formatAddress(vault.smartAccountAddress)}
                    </span>
                  </div>
                )}
                {vault.dcaAmount && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">DCA Amount</span>
                    <span className="font-mono font-medium">
                      ${vault.dcaAmount}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="size-3.5" />
                    <span>Created</span>
                  </div>
                  <span className="font-medium">
                    {formatDate(vault.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {vault.smartAccountAddress && (
              <BuyCard
                smartAccountAddress={vault.smartAccountAddress}
                compositions={compositions}
              />
            )}
          </div>
        </div>
      </div>
    </ContentLayout>
  );
}
