import Image from "next/image";
import Link from "next/link";
import { StockLogo } from "@/components/StockLogo";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getChainConfig } from "@/lib/constants";
import { getStockByTicker } from "@/lib/data";
import { formatAddress, formatCurrency } from "@/lib/formatters";

type VaultSummary = {
  id: string;
  name: string;
  strategy: string;
  chainId: number;
  smartAccountAddress: string | null;
  compositions: {
    ticker: string;
    weight: number;
  }[];
};

export function VaultCard({ vault }: { vault: VaultSummary }) {
  const chainConfig = getChainConfig(vault.chainId);

  return (
    <Link href={`/vault/${vault.id}`} className="h-full">
      <Card className="h-full transition-colors hover:bg-muted/50">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">{vault.name}</h3>
              <Badge
                variant="secondary"
                className="font-mono text-xs uppercase"
              >
                {vault.strategy}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Image
                src={chainConfig.logo}
                alt={chainConfig.name}
                width={16}
                height={16}
                className="rounded-full"
              />
              {vault.compositions.slice(0, 3).map((comp) => {
                const stock = getStockByTicker(comp.ticker);
                return (
                  <StockLogo
                    key={comp.ticker}
                    ticker={comp.ticker}
                    color={stock?.color ?? "#666"}
                    logo={stock?.logo}
                    size="sm"
                  />
                );
              })}
              {vault.compositions.length > 3 && (
                <span className="ml-0.5 text-xs text-muted-foreground">
                  +{vault.compositions.length - 3}
                </span>
              )}
            </div>
          </div>

          {vault.smartAccountAddress && (
            <p className="font-mono text-xs text-muted-foreground">
              {formatAddress(vault.smartAccountAddress)}
            </p>
          )}

          <div className="flex items-baseline justify-between">
            <p className="font-mono text-xl font-bold">{formatCurrency(0)}</p>
          </div>

          <div className="flex h-1 gap-px overflow-hidden rounded-full">
            {vault.compositions.map((comp) => {
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
        </CardContent>
      </Card>
    </Link>
  );
}
