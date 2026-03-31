import { formatCurrency } from "@/lib/formatters";

export function BalanceHeader({
  totalBalance,
  dailyGainAmount,
  dailyGainPercent,
}: {
  totalBalance: number;
  dailyGainAmount: number;
  dailyGainPercent: number;
  showEmpty?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
        Total Balance
      </p>
      <div className="flex items-baseline gap-4">
        <p className="font-mono text-4xl font-bold tracking-tight">
          {formatCurrency(totalBalance)}
        </p>
        {dailyGainAmount !== 0 && (
          <span className="rounded bg-primary/10 px-2.5 py-1 font-mono text-xs font-medium text-primary">
            +{formatCurrency(dailyGainAmount)} · +{dailyGainPercent.toFixed(1)}%
            today
          </span>
        )}
      </div>
    </div>
  );
}
