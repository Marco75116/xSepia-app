"use client";

import { LogOut, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatAddress } from "@/lib/formatters";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              className="gap-2 rounded-lg border-border px-4 py-2 text-sm font-medium"
            />
          }
        >
          <Wallet className="size-4" />
          {formatAddress(address)}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="size-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        variant="outline"
        className="gap-2 rounded-lg border-border px-4 py-2 text-sm font-medium"
        onClick={() => setDialogOpen(true)}
      >
        <Wallet className="size-4" />
        Connect Wallet
      </Button>
      <ConnectWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
