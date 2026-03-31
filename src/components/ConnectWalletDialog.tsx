"use client";

import { Loader2, Wallet } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ConnectWalletDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { connectors, connect, isPending, variables } = useConnect();
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected && open) {
      onOpenChange(false);
    }
  }, [isConnected, open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to xStocks.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {connectors.map((connector) => {
            const pendingConnector = variables?.connector;
            const pendingId =
              pendingConnector && "id" in pendingConnector
                ? (pendingConnector as { id: string }).id
                : undefined;
            const isLoading = isPending && pendingId === connector.id;

            return (
              <Button
                key={connector.uid}
                variant="outline"
                className={cn(
                  "w-full justify-start gap-3 px-4 py-6 text-sm font-medium",
                  isLoading && "opacity-70",
                )}
                disabled={isPending}
                onClick={() => connect({ connector })}
              >
                {connector.icon ? (
                  <Image
                    src={connector.icon}
                    alt={connector.name}
                    width={24}
                    height={24}
                    className="size-6 rounded-md"
                    unoptimized
                  />
                ) : (
                  <Wallet className="size-6 text-muted-foreground" />
                )}
                <span className="flex-1 text-left">{connector.name}</span>
                {isLoading && <Loader2 className="size-4 animate-spin" />}
              </Button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
