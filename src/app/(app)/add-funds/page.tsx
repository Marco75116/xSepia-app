"use client";

import { Check, Copy, Wallet } from "lucide-react";
import { useState } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { ContentLayout } from "@/components/ContentLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { accountFactoryAbi } from "@/lib/abis/accountFactory";
import { ACCOUNT_FACTORY_ADDRESS, INK_CHAIN_ID } from "@/lib/constants";
import { formatAddress } from "@/lib/formatters";

function ConnectPrompt() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="rounded-lg bg-primary/10 p-3">
          <Wallet className="size-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Connect your wallet</h2>
          <p className="text-sm text-muted-foreground">
            Deposit USDC to start funding your vaults.
          </p>
        </div>
        <Button
          className="w-full max-w-xs"
          size="lg"
          onClick={() => setDialogOpen(true)}
        >
          Connect Wallet
        </Button>
        <ConnectWalletDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </CardContent>
    </Card>
  );
}

function DepositInfo({ address }: { address: `0x${string}` }) {
  const [copied, setCopied] = useState(false);

  const { data: depositAddress } = useReadContract({
    address: ACCOUNT_FACTORY_ADDRESS,
    abi: accountFactoryAbi,
    functionName: "predictAddress",
    args: [address],
    chainId: INK_CHAIN_ID,
  });

  function copyAddress() {
    if (!depositAddress) return;
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="rounded-lg bg-primary/10 p-3">
          <Wallet className="size-6 text-primary" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold">Deposit USDC</h2>
          <p className="text-sm text-muted-foreground">
            Send USDC on Ink to your deposit address below.
          </p>
        </div>
        {depositAddress && (
          <button
            type="button"
            onClick={copyAddress}
            className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-3 text-left transition-colors hover:bg-muted"
          >
            <code className="flex-1 truncate text-sm">{depositAddress}</code>
            {copied ? (
              <Check className="size-4 shrink-0 text-green-600" />
            ) : (
              <Copy className="size-4 shrink-0 text-muted-foreground" />
            )}
          </button>
        )}
        <p className="text-xs text-muted-foreground">
          Connected as {formatAddress(address)}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AddFundsPage() {
  const { address, isConnected } = useAccount();

  return (
    <ContentLayout>
      <div className="space-y-4">
        <h1 className="text-lg font-semibold">Add Funds</h1>
        {isConnected && address ? (
          <DepositInfo address={address} />
        ) : (
          <ConnectPrompt />
        )}
      </div>
    </ContentLayout>
  );
}
