"use client";

import { Check, Loader2, Plus, SendHorizontal, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
  useSwitchChain,
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
import { INK_CHAIN_ID, USDC_ADDRESS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";

export function FundDialog({
  smartAccountAddress,
  children,
}: {
  smartAccountAddress: string;
  children?: React.ReactNode;
}) {
  const { address, isConnected } = useAccount();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [connectOpen, setConnectOpen] = useState(false);

  const { data: walletBalance, refetch: refetchBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: INK_CHAIN_ID,
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
      chainId: INK_CHAIN_ID,
      query: { enabled: !!txHash },
    });

  useEffect(() => {
    if (isConfirmed) {
      setAmount("");
      refetchBalance();
    }
  }, [isConfirmed, refetchBalance]);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (!nextOpen) {
      setAmount("");
      reset();
    }
  }

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
      address: USDC_ADDRESS,
      abi: erc20Abi,
      functionName: "transfer",
      args: [smartAccountAddress as `0x${string}`, amountInDecimals],
      chainId: INK_CHAIN_ID,
    });
  }

  function handleMax() {
    if (formattedBalance > 0) {
      setAmount(String(formattedBalance));
      reset();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="icon" className="size-7">
            <Plus className="size-3.5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Fund Vault</DialogTitle>
          <DialogDescription>
            Transfer USDC from your wallet to this vault.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to fund this vault with USDC.
            </p>
            <Button
              className="w-full gap-1.5"
              onClick={() => setConnectOpen(true)}
            >
              <Wallet className="size-4" />
              Connect Wallet
            </Button>
            <ConnectWalletDialog
              open={connectOpen}
              onOpenChange={setConnectOpen}
            />
          </div>
        ) : (
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
            {isConfirmed && (
              <p className="text-sm font-medium text-positive">
                Vault funded successfully
              </p>
            )}
            {writeError && (
              <p className="text-sm font-medium text-destructive">
                {writeError.message.split("\n")[0]}
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
