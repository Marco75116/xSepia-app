import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AddFundsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-sm font-semibold">Add Funds</h1>

      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-lg bg-primary/10 p-3">
            <Wallet className="size-6 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Connect your wallet</h2>
            <p className="text-xs text-muted-foreground">
              Deposit USDC to start funding your vaults.
            </p>
          </div>
          <Button className="w-full max-w-xs rounded-lg" size="lg">
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
