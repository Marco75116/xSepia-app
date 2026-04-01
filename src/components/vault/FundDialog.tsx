"use client";

import {
  ArrowLeft,
  Check,
  ChevronRight,
  Coins,
  Copy,
  ExternalLink,
  Loader2,
  QrCode,
  SendHorizontal,
  Wallet,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { erc20Abi } from "@/lib/abis/erc20";
import { getChainConfig } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

type FundMethod = "select" | "wallet" | "deposit";

function MethodOption({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-accent"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>
      <div className="flex-1 space-y-0.5">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

function DepositAddressView({ address }: { address: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [address]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="rounded-xl bg-white p-3">
        <QRCodeSVG value={address} size={180} />
      </div>
      <p className="text-sm text-muted-foreground">USDC deposit address</p>
      <button
        type="button"
        onClick={copy}
        className="flex w-full items-center gap-2 rounded-lg bg-muted px-4 py-3 font-mono text-xs transition-colors hover:bg-muted/80"
      >
        <span className="flex-1 truncate">{address}</span>
        {copied ? (
          <Check className="size-4 shrink-0 text-positive" />
        ) : (
          <Copy className="size-4 shrink-0 text-muted-foreground" />
        )}
      </button>
    </div>
  );
}

function WalletTransferView({
  smartAccountAddress,
  chainId,
}: {
  smartAccountAddress: string;
  chainId: number;
}) {
  const chainConfig = getChainConfig(chainId);
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [connectOpen, setConnectOpen] = useState(false);

  const { data: walletBalance, refetch: refetchBalance } = useReadContract({
    address: chainConfig.usdc,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: chainConfig.chainId,
    query: { enabled: !!address },
  });

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: writeError,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash,
      chainId: chainConfig.chainId,
      query: { enabled: !!txHash },
    });

  useEffect(() => {
    if (isConfirmed) {
      setAmount("");
      refetchBalance();
      toast.success("Vault funded successfully", {
        action: txHash
          ? {
              label: (
                <span className="inline-flex items-center gap-1">
                  View on Explorer <ExternalLink className="size-3" />
                </span>
              ),
              onClick: () =>
                window.open(
                  `${chainConfig.explorerUrl}/tx/${txHash}`,
                  "_blank",
                ),
            }
          : undefined,
      });
    }
  }, [isConfirmed, refetchBalance, txHash, chainConfig.explorerUrl]);

  const formattedBalance =
    walletBalance !== undefined ? Number(walletBalance) / 1e6 : 0;

  const parsedAmount = Number.parseFloat(amount);
  const isValid =
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= formattedBalance;

  const isLoading = isSigning || isConfirming;

  function handleFund() {
    if (!isValid || !address) return;

    reset();

    const amountInDecimals = BigInt(Math.floor(parsedAmount * 1e6));

    writeContract({
      address: chainConfig.usdc,
      abi: erc20Abi,
      functionName: "transfer",
      args: [smartAccountAddress as `0x${string}`, amountInDecimals],
      chainId: chainConfig.chainId,
    });
  }

  function handleMax() {
    if (formattedBalance > 0) {
      setAmount(String(formattedBalance));
      reset();
    }
  }

  if (!isConnected) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Connect your wallet to fund this vault with USDC.
        </p>
        <Button className="w-full gap-1.5" onClick={() => setConnectOpen(true)}>
          <Wallet className="size-4" />
          Connect Wallet
        </Button>
        <ConnectWalletDialog open={connectOpen} onOpenChange={setConnectOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Wallet Balance</span>
        <button
          type="button"
          onClick={handleMax}
          className="font-mono font-medium text-primary hover:underline"
        >
          {formatCurrency(formattedBalance)} USDC
        </button>
      </div>
      <div className="flex gap-2">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="USDC amount"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value.replace(/[^0-9.]/g, ""));
            if (isConfirmed) reset();
          }}
          className="font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
          disabled={isLoading}
        />
        <Button
          className="gap-1.5 shrink-0"
          disabled={!isValid || isLoading}
          onClick={handleFund}
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : isConfirmed ? (
            <Check className="size-4" />
          ) : (
            <SendHorizontal className="size-4" />
          )}
          {isSigning ? "Sign" : isConfirming ? "Confirming" : "Fund"}
        </Button>
      </div>
      {writeError && (
        <p className="text-sm font-medium text-destructive">
          {writeError.message.split("\n")[0]}
        </p>
      )}
    </div>
  );
}

export function FundDialog({
  smartAccountAddress,
  chainId,
  children,
}: {
  smartAccountAddress: string;
  chainId: number;
  children?: React.ReactNode;
}) {
  const chainConfig = getChainConfig(chainId);
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<FundMethod>("select");

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setMethod("select");
    }
  }

  const titles: Record<FundMethod, { title: string; description: string }> = {
    select: {
      title: "Fund Vault",
      description: "Select your funding method.",
    },
    wallet: {
      title: "Send from Wallet",
      description: "Transfer USDC from your connected wallet.",
    },
    deposit: {
      title: "Deposit Address",
      description: `Send USDC to this address on ${chainConfig.name}.`,
    },
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="icon" className="size-7">
            <Coins className="size-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {method !== "select" && (
              <button
                type="button"
                onClick={() => setMethod("select")}
                className="rounded-md p-0.5 transition-colors hover:bg-accent"
              >
                <ArrowLeft className="size-4" />
              </button>
            )}
            {titles[method].title}
          </DialogTitle>
          <DialogDescription>{titles[method].description}</DialogDescription>
        </DialogHeader>

        {method === "select" && (
          <div className="space-y-2">
            <MethodOption
              icon={<Wallet className="size-4" />}
              title="Send from your wallet"
              description="Transfer USDC from your connected wallet to this vault."
              onClick={() => setMethod("wallet")}
            />
            <MethodOption
              icon={<QrCode className="size-4" />}
              title="Share deposit address"
              description="Send USDC to this vault's deposit address from any wallet."
              onClick={() => setMethod("deposit")}
            />
          </div>
        )}

        {method === "wallet" && (
          <WalletTransferView
            smartAccountAddress={smartAccountAddress}
            chainId={chainId}
          />
        )}

        {method === "deposit" && (
          <DepositAddressView address={smartAccountAddress} />
        )}
      </DialogContent>
    </Dialog>
  );
}
