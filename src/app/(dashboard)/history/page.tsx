import { ActiveDcaSummary } from "@/components/ActiveDcaSummary";
import { PageHeader } from "@/components/PageHeader";
import { TransactionTable } from "@/components/TransactionTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HistoryPage() {
  return (
    <>
      <PageHeader
        title="History"
        description="View your transaction history and active strategies"
      />
      <ActiveDcaSummary />
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionTable />
        </CardContent>
      </Card>
    </>
  );
}
