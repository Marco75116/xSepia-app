"use client";

import {
  ArrowDownToLine,
  Check,
  ExternalLink,
  Loader2,
  Wallet,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  useAccount,
  useReadContracts,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ConnectWalletDialog } from "@/components/ConnectWalletDialog";
import { StockLogo } from "@/components/StockLogo";
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
import { Separator } from "@/components/ui/separator";
import { erc20Abi } from "@/lib/abis/erc20";
import { userAccountAbi } from "@/lib/abis/userAccount";
import { getChainConfig } from "@/lib/constants";
import { getStockByTicker } from "@/lib/data";
import { api } from "@/lib/eden";

type Composition = {
  ticker: string;
  tokenAddress: string;
  weight: number;
};

function WithdrawRow({
  comp,
  balance,
  smartAccountAddress,
  vaultId,
  chainId,
}: {
  comp: Composition;
  balance: number;
  smartAccountAddress: string;
  vaultId: string;
  chainId: number;
}) {
  const chainConfig = getChainConfig(chainId);
  const stock = getStockByTicker(comp.ticker);
  const { address: connectedAddress } = useAccount();
  const [amount, setAmount] = useState("");
  const submittedAmount = useRef("");
  const hasBalance = balance > 0;

  const {
    writeContract,
    data: txHash,
    isPending: isSigning,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: receiptFetched,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    chainId: chainConfig.chainId,
    query: { enabled: !!txHash },
  });

  const isConfirmed = receiptFetched && receipt?.status === "success";
  const isReverted = receiptFetched && receipt?.status === "reverted";

  useEffect(() => {
    if (!receiptFetched || !txHash) return;
    api.withdraw.post({
      vaultId,
      ticker: comp.ticker,
      tokenAddress: comp.tokenAddress,
      amount: submittedAmount.current,
      txHash,
      status: isReverted ? "failed" : "confirmed",
      chainId,
    });
    if (isConfirmed) {
      setAmount("");
      const stock = getStockByTicker(comp.ticker);
      toast.success(`${stock?.name ?? comp.ticker} withdrawal confirmed`, {
        action: {
          label: (
            <span className="inline-flex items-center gap-1">
              View on Explorer <ExternalLink className="size-3" />
            </span>
          ),
          onClick: () =>
            window.open(`${chainConfig.explorerUrl}/tx/${txHash}`, "_blank"),
        },
      });
    }
    if (isReverted) {
      toast.error("Transaction reverted on-chain", {
        description: "Only the vault owner can withdraw.",
        action: {
          label: (
            <span className="inline-flex items-center gap-1">
              View on Explorer <ExternalLink className="size-3" />
            </span>
          ),
          onClick: () =>
            window.open(`${chainConfig.explorerUrl}/tx/${txHash}`, "_blank"),
        },
      });
    }
  }, [
    receiptFetched,
    txHash,
    vaultId,
    comp.ticker,
    comp.tokenAddress,
    isReverted,
    isConfirmed,
    chainConfig.explorerUrl,
    chainId,
  ]);

  const parsedAmount = Number.parseFloat(amount);
  const isValid =
    !Number.isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= balance;
  const parsedRaw = BigInt(
    Math.floor((Number.isNaN(parsedAmount) ? 0 : parsedAmount) * 1e18),
  );
  const isLoading = isSigning || isConfirming;

  function handleWithdraw() {
    if (!isValid) return;
    reset();
    submittedAmount.current = parsedRaw.toString();
    writeContract({
      address: smartAccountAddress as `0x${string}`,
      abi: userAccountAbi,
      functionName: "withdraw",
      args: [comp.tokenAddress as `0x${string}`, parsedRaw, connectedAddress!],
      chainId: chainConfig.chainId,
    });
  }

  function handleMax() {
    if (balance > 0) {
      setAmount(String(balance));
      reset();
    }
  }

  return (
    <div className="space-y-2 px-1 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <StockLogo
            ticker={comp.ticker}
            color={stock?.color ?? "#666"}
            logo={stock?.logo}
            size="sm"
          />
          <div>
            <p className="text-sm font-medium">{stock?.name ?? comp.ticker}</p>
            <p className="text-xs text-muted-foreground">
              {hasBalance
                ? `${balance < 0.0001 ? balance.toExponential(2) : balance.toFixed(4)} tokens`
                : "No balance"}
            </p>
          </div>
        </div>
      </div>
      {hasBalance && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              inputMode="decimal"
              placeholder="Amount"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/[^0-9.]/g, ""));
                if (isConfirmed) reset();
              }}
              className="font-mono text-xs focus-visible:ring-0 focus-visible:ring-offset-0 pr-12"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleMax}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-primary hover:underline"
            >
              Max
            </button>
          </div>
          <Button
            size="sm"
            variant={isReverted ? "destructive" : "outline"}
            className="gap-1.5 shrink-0"
            disabled={!isValid || isLoading}
            onClick={handleWithdraw}
          >
            {isLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : isConfirmed ? (
              <Check className="size-3.5" />
            ) : (
              <ArrowDownToLine className="size-3.5" />
            )}
            {isSigning
              ? "Sign"
              : isConfirming
                ? "Confirming"
                : isConfirmed
                  ? "Done"
                  : isReverted
                    ? "Failed"
                    : "Withdraw"}
          </Button>
        </div>
      )}
      {writeError && (
        <p className="text-xs font-medium text-destructive">
          {writeError.message.split("\n")[0]}
        </p>
      )}
    </div>
  );
}

export function WithdrawDialog({
  vaultId,
  smartAccountAddress,
  compositions,
  chainId,
}: {
  vaultId: string;
  smartAccountAddress: string;
  compositions: Composition[];
  chainId: number;
}) {
  const [open, setOpen] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);
  const { isConnected } = useAccount();
  const chainConfig = getChainConfig(chainId);

  const account = smartAccountAddress as `0x${string}`;

  const contracts = compositions.map((comp) => ({
    address: comp.tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf" as const,
    args: [account],
    chainId: chainConfig.chainId,
  }));

  const { data } = useReadContracts({
    contracts,
    query: { enabled: open },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <ArrowDownToLine className="size-3.5" />
          Withdraw
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Withdraw Assets</DialogTitle>
          <DialogDescription>
            Withdraw tokens from your smart account to your wallet.
          </DialogDescription>
        </DialogHeader>

        {!isConnected ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Connect your wallet to withdraw assets.
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
          <div>
            {compositions.map((comp, i) => {
              const result = data?.[i];
              const balance =
                result?.status === "success" ? Number(result.result) / 1e18 : 0;

              return (
                <div key={comp.ticker}>
                  {i > 0 && <Separator />}
                  <WithdrawRow
                    comp={comp}
                    balance={balance}
                    smartAccountAddress={smartAccountAddress}
                    vaultId={vaultId}
                    chainId={chainId}
                  />
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
