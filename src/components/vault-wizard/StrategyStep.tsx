"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Hand, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import type { WizardAction, WizardState } from "@/app/(app)/vault/new/page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { StrategyOptionCard } from "@/components/vault-wizard/StrategyOptionCard";
import { VaultReviewCard } from "@/components/vault-wizard/VaultReviewCard";
import { useChain } from "@/lib/chain-context";
import { getStockByTicker } from "@/lib/data";
import { api } from "@/lib/eden";

const strategies = [
  {
    key: "manual" as const,
    title: "Manual",
    description: "Buy whenever you decide",
    icon: Hand,
  },
  {
    key: "dca" as const,
    title: "Automatic DCA",
    description: "Automated recurring buys",
    icon: RefreshCw,
  },
];

export function StrategyStep({
  state,
  dispatch,
}: {
  state: WizardState;
  dispatch: React.Dispatch<WizardAction>;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { chainId } = useChain();
  const router = useRouter();

  const canCreate =
    state.strategy === "manual"
      ? state.vaultName.trim().length > 0
      : state.amount > 0 && state.vaultName.trim().length > 0;

  async function handleCreateVault() {
    if (!isConnected || !address) {
      setError("Please connect your wallet first.");
      return;
    }

    setCreating(true);
    setError(null);

    const allocations = state.selectedTickers
      .filter((ticker) => (state.allocations[ticker] ?? 0) > 0)
      .map((ticker) => {
        const stock = getStockByTicker(ticker);
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
    });

    if (apiError) {
      setError("Failed to create vault. Please try again.");
      setCreating(false);
      return;
    }

    router.push(`/vault/${data.vault.id}`);
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {strategies.map((s) => (
          <StrategyOptionCard
            key={s.key}
            title={s.title}
            description={s.description}
            icon={s.icon}
            selected={state.strategy === s.key}
            onClick={() => dispatch({ type: "SET_STRATEGY", strategy: s.key })}
          />
        ))}
      </div>

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {state.strategy === "dca" && (
            <motion.div
              key="dca-config"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="dca-frequency">Frequency</Label>
                  <Select
                    value={state.dcaFrequency}
                    onValueChange={(v) =>
                      dispatch({
                        type: "SET_DCA_FREQUENCY",
                        frequency: v as WizardState["dcaFrequency"],
                      })
                    }
                  >
                    <SelectTrigger
                      id="dca-frequency"
                      className="focus:ring-0 focus:ring-offset-0"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Every Day</SelectItem>
                      <SelectItem value="weekly">Every Week</SelectItem>
                      <SelectItem value="monthly">Every Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vault-amount">Amount</Label>
                  <Input
                    id="vault-amount"
                    type="text"
                    inputMode="decimal"
                    value={state.amount || ""}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^0-9.]/g, "");
                      dispatch({
                        type: "SET_AMOUNT",
                        amount: Number(v),
                      });
                    }}
                    placeholder="$ 0.00"
                    className="font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="vault-name">Vault Name</Label>
          <Input
            id="vault-name"
            value={state.vaultName}
            onChange={(e) =>
              dispatch({ type: "SET_VAULT_NAME", name: e.target.value })
            }
            placeholder="e.g. Tech Growth Portfolio"
            className="focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        <Button
          size="lg"
          className="w-full gap-2"
          disabled={!canCreate}
          onClick={() => setDialogOpen(true)}
        >
          Review & Create
          <Check className="size-4" />
        </Button>
      </div>

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
