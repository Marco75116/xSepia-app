"use client";

import { Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { ContentLayout } from "@/components/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ConnectGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isConnected) {
      setDialogOpen(false);
    }
  }, [mounted, isConnected]);

  if (!mounted) {
    return null;
  }

  if (!isConnected) {
    return (
      <ContentLayout>
        <div className="flex items-center justify-center py-20">
          <Card className="w-full max-w-sm">
            <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <Wallet className="size-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h2 className="text-base font-semibold">Wallet Required</h2>
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to access your vaults.
                </p>
              </div>
              <Button
                className="w-full gap-2"
                onClick={() => setDialogOpen(true)}
              >
                <Wallet className="size-4" />
                Connect Wallet
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => router.push("/")}
              >
                Back to Overview
              </Button>
            </CardContent>
          </Card>
        </div>
        <ConnectWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </ContentLayout>
    );
  }

  return children;
}
