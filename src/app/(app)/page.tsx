import Link from "next/link";
import { BalanceHeader } from "@/components/BalanceHeader";
import { StrategyHealthCard } from "@/components/StrategyHealthCard";
import { VaultCard } from "@/components/VaultCard";
import { VAULTS } from "@/lib/data";

export default function HomePage() {
  const totalBalance = VAULTS.reduce((sum, v) => sum + v.totalValue, 0);
  const totalDailyGain = VAULTS.reduce((sum, v) => sum + v.dailyGainAmount, 0);
  const totalDailyPercent =
    totalBalance > 0
      ? (totalDailyGain / (totalBalance - totalDailyGain)) * 100
      : 0;

  return (
    <div className="space-y-8">
      <BalanceHeader
        totalBalance={totalBalance}
        dailyGainAmount={totalDailyGain}
        dailyGainPercent={totalDailyPercent}
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Your Vaults</h2>
          <Link
            href="/vault/new"
            className="text-primary text-xs font-medium hover:text-primary/80"
          >
            + New
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VAULTS.map((vault) => (
            <VaultCard key={vault.id} vault={vault} />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StrategyHealthCard />
      </div>
    </div>
  );
}
