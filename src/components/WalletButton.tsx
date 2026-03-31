"use client";

import { Check, Copy, LogOut, Wallet } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { Button } from "@/components/ui/button";
import { formatAddress } from "@/lib/formatters";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyAddress = useCallback(() => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  if (mounted && isConnected && address) {
    return (
      <div className="flex items-center gap-1">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium">
          <Wallet className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{formatAddress(address)}</span>
          <button
            type="button"
            onClick={copyAddress}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? (
              <Check className="size-3.5" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => disconnect()}
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className="w-full gap-2 rounded-lg border-border px-4 py-2 text-sm font-medium"
        onClick={() => setDialogOpen(true)}
      >
        <Wallet className="size-4" />
        Connect Wallet
      </Button>
      <ConnectWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
