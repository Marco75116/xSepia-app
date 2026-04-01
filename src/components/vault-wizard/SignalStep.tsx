"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  DollarSign,
  Loader2,
  Minus,
  Pause,
  Plus,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import type { WizardAction, WizardState } from "@/app/(app)/vault/new/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { SignalAction } from "@/components/vault-wizard/SignalActionCard";
import { SignalActionCard } from "@/components/vault-wizard/SignalActionCard";
import { SignalCard } from "@/components/vault-wizard/SignalCard";
import { VaultReviewCard } from "@/components/vault-wizard/VaultReviewCard";
import { useChain } from "@/lib/chain-context";
import { getStockByTicker, getStocksByChainId } from "@/lib/data";
import { api } from "@/lib/eden";
import { cn } from "@/lib/utils";

type Signal = {
  id: string;
  question: string;
  category: string;
  probability: number;
  volume: number;
  endDate: string;
  image: string;
};

type Category = {
  key: string;
  label: string;
};

const actions = [
  {
    key: "rebalance" as SignalAction,
    title: "Change Allocation",
    description: "Rebalance portfolio weights",
    icon: RefreshCw,
  },
  {
    key: "buy" as SignalAction,
    title: "Buy Asset",
    description: "Buy 100% into a single asset",
    icon: ShoppingCart,
  },
  {
    key: "exit" as SignalAction,
    title: "Exit to Cash",
    description: "Move all positions to USDC",
    icon: DollarSign,
  },
  {
    key: "pause" as SignalAction,
    title: "Pause Buying",
    description: "Stop auto-allocations until resolved",
    icon: Pause,
  },
];

function thresholdColor(value: number): string {
  if (value >= 50) return "bg-red-500";
  if (value >= 35) return "bg-amber-500";
  return "bg-emerald-500";
}

export function SignalStep({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"browse" | "configure">("browse");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { chainId } = useChain();
  const router = useRouter();

  const fetchSignals = useCallback(async (tag?: string) => {
    setLoading(true);
    const params: Record<string, string> = { limit: "20" };
    if (tag) params.tag = tag;
    const { data, error } = await api.signals.get({ query: params });
    if (!error && data) {
      setSignals(data.signals);
      if (data.categories.length > 0) {
        setCategories(data.categories);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSignals(activeTag ?? undefined);
  }, [activeTag, fetchSignals]);

  async function handleCreateVault() {
    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }

    setCreating(true);
    setError(null);

    const chainStocks = getStocksByChainId(chainId);
    const allocations = state.selectedTickers
      .filter((ticker) => (state.allocations[ticker] ?? 0) > 0)
      .map((ticker) => {
        const stock =
          chainStocks.find((s) => s.ticker === ticker) ??
          getStockByTicker(ticker);
        return {
          ticker,
          tokenAddress: stock?.address ?? "",
          weight: state.allocations[ticker],
        };
      });

    const { data, error: apiError } = await api.vault.post({
      owner: address,
      name: state.vaultName.trim(),
      chainId,
      allocations,
      strategy: state.strategy,
      dcaFrequency: state.strategy === "dca" ? state.dcaFrequency : undefined,
      dcaAmount: state.strategy === "dca" ? state.amount : undefined,
      signalId: state.signal?.id ?? undefined,
      signalQuestion: state.signal?.question ?? undefined,
      signalThreshold: state.signal ? state.signalThreshold : undefined,
      signalAction: state.signal
        ? (state.signalAction ?? undefined)
        : undefined,
    });

    if (apiError) {
      setError("Failed to create vault. Please try again.");
      setCreating(false);
      return;
    }

    router.push(`/vault/${data.vault.id}`);
  }

  function handleSelectSignal(signal: Signal) {
    dispatch({
      type: "SET_SIGNAL",
      signal: {
        id: signal.id,
        question: signal.question,
        probability: signal.probability,
      },
    });
    setView("configure");
  }

  function handleBack() {
    setView("browse");
    dispatch({ type: "CLEAR_SIGNAL" });
  }

  if (view === "configure" && state.signal) {
    return (
      <div className="mx-auto max-w-lg space-y-6 px-4">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          onClick={handleBack}
        >
          <ArrowLeft className="size-3.5" />
          Back to signals
        </Button>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <TrendingUp className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                Selected Signal
              </p>
              <p className="text-sm font-medium leading-snug">
                {state.signal.question}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Probability Threshold
          </p>
          <Card>
            <CardContent className="flex flex-col items-center gap-4 p-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-full"
                  onClick={() =>
                    dispatch({
                      type: "SET_SIGNAL_THRESHOLD",
                      threshold: Math.max(5, state.signalThreshold - 5),
                    })
                  }
                  disabled={state.signalThreshold <= 5}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="font-mono text-5xl font-bold tabular-nums">
                  {state.signalThreshold}%
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-10 rounded-full"
                  onClick={() =>
                    dispatch({
                      type: "SET_SIGNAL_THRESHOLD",
                      threshold: Math.min(95, state.signalThreshold + 5),
                    })
                  }
                  disabled={state.signalThreshold >= 95}
                >
                  <Plus className="size-4" />
                </Button>
              </div>
              <div className="w-full space-y-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      thresholdColor(state.signalThreshold),
                    )}
                    style={{ width: `${state.signalThreshold}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                  <span>Conservative</span>
                  <span>Aggressive</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            What should it do?
          </p>
          <div className="space-y-2">
            {actions.map((a) => (
              <SignalActionCard
                key={a.key}
                title={a.title}
                description={a.description}
                icon={a.icon}
                selected={state.signalAction === a.key}
                onClick={() =>
                  dispatch({ type: "SET_SIGNAL_ACTION", action: a.key })
                }
              />
            ))}
          </div>
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          disabled={!state.signalAction}
          onClick={() => setDialogOpen(true)}
        >
          Review & Create
          <Check className="size-4" />
        </Button>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            if (!creating) setDialogOpen(open);
          }}
        >
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={(e) => {
              if (creating) e.preventDefault();
            }}
            onEscapeKeyDown={(e) => {
              if (creating) e.preventDefault();
            }}
          >
            {creating ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <Loader2 className="text-primary size-10 animate-spin" />
                <div className="text-center">
                  <p className="font-semibold text-lg">Creating your vault</p>
                  <p className="text-muted-foreground text-sm">
                    Deploying your smart account on-chain...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Confirm Vault</DialogTitle>
                  <DialogDescription>
                    Review your vault configuration before creating it.
                  </DialogDescription>
                </DialogHeader>

                <VaultReviewCard state={state} />

                {error && <p className="text-sm text-destructive">{error}</p>}

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Back
                  </Button>
                  <Button
                    className="gap-2"
                    onClick={handleCreateVault}
                    disabled={!isConnected}
                  >
                    Create Vault
                    <Check className="size-4" />
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Signal Browser</h2>
        <p className="text-sm text-muted-foreground">
          Choose a market signal to trigger automated actions
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge
          className={cn(
            "cursor-pointer transition-colors",
            activeTag === null
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
          onClick={() => setActiveTag(null)}
        >
          All
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat.key}
            className={cn(
              "cursor-pointer transition-colors",
              activeTag === cat.key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
            onClick={() => setActiveTag(cat.key)}
          >
            {cat.label}
          </Badge>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : signals.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No signals found
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTag ?? "all"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {signals.map((signal, i) => (
              <SignalCard
                key={signal.id}
                question={signal.question}
                probability={signal.probability}
                category={signal.category}
                image={signal.image}
                selected={state.signal?.id === signal.id}
                onClick={() => handleSelectSignal(signal)}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      <Button
        variant="outline"
        size="lg"
        className="w-full gap-2"
        onClick={() => setDialogOpen(true)}
      >
        Skip & Create Vault
        <ArrowLeft className="size-4 rotate-180" />
      </Button>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!creating) setDialogOpen(open);
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) => {
            if (creating) e.preventDefault();
          }}
          onEscapeKeyDown={(e) => {
            if (creating) e.preventDefault();
          }}
        >
          {creating ? (
            <div className="flex flex-col items-center gap-4 py-10">
              <Loader2 className="text-primary size-10 animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-lg">Creating your vault</p>
                <p className="text-muted-foreground text-sm">
                  Deploying your smart account on-chain...
                </p>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Confirm Vault</DialogTitle>
                <DialogDescription>
                  Review your vault configuration before creating it.
                </DialogDescription>
              </DialogHeader>

              <VaultReviewCard state={state} />

              {error && <p className="text-sm text-destructive">{error}</p>}

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Back
                </Button>
                <Button
                  className="gap-2"
                  onClick={handleCreateVault}
                  disabled={!isConnected}
                >
                  Create Vault
                  <Check className="size-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
