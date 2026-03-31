import { ContentLayout } from "@/components/ContentLayout";
import { Card, CardContent } from "@/components/ui/card";
import { TRANSACTIONS } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/formatters";

export default function ActivityPage() {
  return (
    <ContentLayout>
      <div className="space-y-4">
        <h1 className="text-sm font-semibold">Activity</h1>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-[10px] font-medium tracking-widest text-muted-foreground uppercase">
                  <td className="px-4 py-2.5">Asset</td>
                  <td className="px-4 py-2.5">Type</td>
                  <td className="px-4 py-2.5">Date</td>
                  <td className="px-4 py-2.5 text-right">Shares</td>
                  <td className="px-4 py-2.5 text-right">Amount</td>
                  <td className="px-4 py-2.5 text-right">Status</td>
                </tr>
              </thead>
              <tbody>
                {TRANSACTIONS.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-border last:border-0 transition-colors hover:bg-accent"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-medium">
                      {tx.ticker}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded px-1.5 py-px font-mono text-[10px] font-medium uppercase ${
                          tx.type === "buy"
                            ? "bg-positive/10 text-positive"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-[11px] text-muted-foreground">
                      {tx.shares.toFixed(4)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-medium">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={`font-mono text-[10px] ${
                          tx.status === "completed"
                            ? "text-positive"
                            : tx.status === "pending"
                              ? "text-yellow-500"
                              : "text-destructive"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </ContentLayout>
  );
}
