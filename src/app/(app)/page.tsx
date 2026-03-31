"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BalanceHeader } from "@/components/BalanceHeader";
import { ContentLayout } from "@/components/ContentLayout";
import { CreateVaultCard } from "@/components/CreateVaultCard";
import { VaultCard } from "@/components/VaultCard";
import { api } from "@/lib/eden";

type VaultSummary = {
  id: string;
  name: string;
  owner: string;
  smartAccountAddress: string | null;
  strategy: string;
  dcaFrequency: string | null;
  createdAt: string;
  compositions: {
    ticker: string;
    tokenAddress: string;
    weight: number;
  }[];
};

export default function HomePage() {
  const [vaults, setVaults] = useState<VaultSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVaults() {
      const { data } = await api.vaults.get();
      if (data) {
        setVaults(data as VaultSummary[]);
      }
      setLoading(false);
    }

    fetchVaults();
  }, []);

  return (
    <ContentLayout>
      <div className="space-y-8">
        <BalanceHeader
          totalBalance={0}
          dailyGainAmount={0}
          dailyGainPercent={0}
        />

        <div className="space-y-4">
          <h2 className="text-sm font-semibold">Your Vaults</h2>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vaults.map((vault) => (
                <VaultCard key={vault.id} vault={vault} />
              ))}
              <CreateVaultCard />
            </div>
          )}
        </div>
      </div>
    </ContentLayout>
  );
}
