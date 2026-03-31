import { Bell } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

export function BalanceHeader({
  totalBalance,
  dailyGainAmount,
  dailyGainPercent,
  showEmpty = false,
}: {
  totalBalance: number;
  dailyGainAmount: number;
  dailyGainPercent: number;
  showEmpty?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
            {showEmpty ? "Welcome back" : "Good morning"}
          </p>
          <p className="text-sm font-semibold text-primary">
            {showEmpty ? "Good morning" : "Alex"}
          </p>
        </div>
        <button
          type="button"
          className="relative rounded p-1.5 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-4" />
          <span className="absolute top-1 right-1 size-1.5 rounded-full bg-primary" />
        </button>
      </div>

      <div className="pt-4 text-center">
        <p className="text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
          Total Balance
        </p>
        <p className="mt-1 font-mono text-4xl font-bold tracking-tight">
          {formatCurrency(totalBalance)}
        </p>
      </div>

      {!showEmpty && dailyGainAmount !== 0 && (
        <div className="flex justify-center pt-1">
          <span className="rounded bg-primary/10 px-2.5 py-1 font-mono text-xs font-medium text-primary">
            +{formatCurrency(dailyGainAmount)} · +{dailyGainPercent.toFixed(1)}%
            today
          </span>
        </div>
      )}
    </div>
  );
}
