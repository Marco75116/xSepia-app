import { Card, CardContent } from "@/components/ui/card";
import { TRANSACTIONS } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function ActivityPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-sm font-semibold">Activity</h1>

      <div className="space-y-1.5">
        {TRANSACTIONS.map((tx) => (
          <Card key={tx.id} className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <p className="font-mono text-xs font-medium">{tx.ticker}</p>
                  <span
                    className={`rounded px-1.5 py-px font-mono text-[10px] font-medium uppercase ${
                      tx.type === "buy"
                        ? "bg-primary/10 text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {tx.type}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {formatDate(tx.date)} · {tx.shares.toFixed(4)} shares
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-xs font-semibold">
                  {formatCurrency(tx.amount)}
                </p>
                <span
                  className={`font-mono text-[10px] ${
                    tx.status === "completed"
                      ? "text-primary"
                      : tx.status === "pending"
                        ? "text-yellow-500"
                        : "text-destructive"
                  }`}
                >
                  {tx.status}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
