"use client";

import {
  Calendar,
  Coins,
  Globe,
  Layers,
  Loader2,
  TrendingUp,
  User,
  Vault,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { use, useEffect, useState } from "react";
import { useReadContracts } from "wagmi";
import { ConnectGuard } from "@/components/ConnectGuard";
import { ContentLayout } from "@/components/ContentLayout";
import { CopyableAddress } from "@/components/CopyableAddress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BuyDialog } from "@/components/vault/BuyDialog";
import { FundDialog } from "@/components/vault/FundDialog";
import { OrdersHistory } from "@/components/vault/OrdersHistory";
import { VaultHistoryChart } from "@/components/vault/VaultHistoryChart";
import { VaultValueChart } from "@/components/vault/VaultValueChart";
import { WithdrawDialog } from "@/components/vault/WithdrawDialog";
import { erc20Abi } from "@/lib/abis/erc20";
import { DEFAULT_CHAIN_ID, getChainConfig } from "@/lib/constants";
import { api } from "@/lib/eden";
import { formatCurrency, formatDate } from "@/lib/formatters";

const actionLabels: Record<string, string> = {
  rebalance: "Change Allocation",
  buy: "Buy Asset",
  exit: "Exit to Cash",
  pause: "Pause Buying",
};

type VaultData = {
  vault: {
    id: string;
    name: string;
    owner: string;
    chainId: number;
    smartAccountAddress: string | null;
    strategy: string;
    dcaFrequency: string | null;
    dcaAmount: string | null;
    signalId: string | null;
    signalQuestion: string | null;
    signalThreshold: number | null;
    signalAction: string | null;
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

  const vaultChainId = data?.vault.chainId ?? DEFAULT_CHAIN_ID;
  const chainConfig = getChainConfig(vaultChainId);

  const smartAccount = data?.vault.smartAccountAddress as
    | `0x${string}`
    | undefined;

  const { data: usdcData } = useReadContracts({
    contracts: smartAccount
      ? [
          {
            address: chainConfig.usdc,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [smartAccount],
            chainId: chainConfig.chainId,
          },
        ]
      : [],
    query: { enabled: !!smartAccount },
  });

  const usdcBalance =
    usdcData?.[0]?.status === "success" ? Number(usdcData[0].result) / 1e6 : 0;

  if (error) {
    notFound();
  }

  if (loading || !data) {
    return (
      <ContentLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
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
    <ConnectGuard>
      <ContentLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">{vault.name}</h1>
            <Badge variant="secondary" className="font-mono uppercase">
              {vault.strategy}
            </Badge>
            <Badge variant="outline" className="gap-1.5">
              <Image
                src={chainConfig.logo}
                alt={chainConfig.name}
                width={14}
                height={14}
                className="rounded-full"
              />
              {chainConfig.shortName}
            </Badge>
            {vault.smartAccountAddress && (
              <Badge variant="secondary" className="gap-1.5 font-mono">
                <Wallet className="size-3" />
                {formatCurrency(usdcBalance)} USDC
              </Badge>
            )}
            {vault.smartAccountAddress && (
              <FundDialog
                smartAccountAddress={vault.smartAccountAddress}
                chainId={vaultChainId}
              >
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Coins className="size-3.5" />
                  Fund
                </Button>
              </FundDialog>
            )}
            {vault.smartAccountAddress && (
              <BuyDialog
                vaultId={vault.id}
                smartAccountAddress={vault.smartAccountAddress}
                compositions={compositions}
                chainId={vaultChainId}
              />
            )}
            {vault.smartAccountAddress && (
              <WithdrawDialog
                vaultId={vault.id}
                smartAccountAddress={vault.smartAccountAddress}
                compositions={compositions}
                chainId={vaultChainId}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[4fr_8fr_8fr]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Globe className="size-3.5" />
                    <span>Network</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Image
                      src={chainConfig.logo}
                      alt={chainConfig.name}
                      width={14}
                      height={14}
                      className="rounded-full"
                    />
                    {chainConfig.shortName}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    {vault.strategy === "dca" ? (
                      <TrendingUp className="size-3.5" />
                    ) : (
                      <Layers className="size-3.5" />
                    )}
                    <span>Strategy</span>
                  </div>
                  <span className="font-medium capitalize">
                    {vault.strategy === "dca"
                      ? `DCA${vault.dcaFrequency ? ` \u00B7 ${vault.dcaFrequency}` : ""}`
                      : "Manual"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="size-3.5" />
                    <span>Owner</span>
                  </div>
                  <CopyableAddress address={vault.owner} />
                </div>
                {vault.smartAccountAddress && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Vault className="size-3.5" />
                      <span>Smart Account</span>
                    </div>
                    <CopyableAddress address={vault.smartAccountAddress} />
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
                {vault.signalQuestion && (
                  <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="size-3.5 text-primary" />
                      <span className="text-xs font-semibold">Signal</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug">
                      {vault.signalQuestion}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {vault.signalThreshold != null && (
                        <Badge variant="secondary" className="text-[10px]">
                          Threshold: {vault.signalThreshold}%
                        </Badge>
                      )}
                      {vault.signalAction && (
                        <Badge variant="outline" className="text-[10px]">
                          {actionLabels[vault.signalAction] ??
                            vault.signalAction}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {vault.smartAccountAddress && (
              <VaultValueChart
                smartAccountAddress={vault.smartAccountAddress}
                compositions={compositions}
                chainId={vaultChainId}
              />
            )}

            <OrdersHistory vaultId={vault.id} chainId={vaultChainId} />
          </div>

          <VaultHistoryChart />
        </div>
      </ContentLayout>
    </ConnectGuard>
  );
}
