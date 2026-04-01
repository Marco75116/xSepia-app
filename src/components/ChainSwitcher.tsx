"use client";

import { ChevronDown, Globe } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useAccount, useConfig } from "wagmi";
import { switchChain as requestWalletChainSwitch } from "wagmi/actions";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChain } from "@/lib/chain-context";
import {
  CHAIN_CONFIGS,
  getWalletChainShortLabel,
  isAppSupportedChain,
  SUPPORTED_CHAIN_IDS,
  type SupportedChainId,
} from "@/lib/constants";
import { walletErrorMessage } from "@/lib/walletErrorMessage";

export function ChainSwitcher() {
  const { chainId, walletChainId, setChainId, config } = useChain();
  const wagmiConfig = useConfig();
  const { isConnected, connector } = useAccount();
  const [isSwitchPending, setIsSwitchPending] = useState(false);

  const walletOnUnknownChain =
    isConnected &&
    walletChainId !== undefined &&
    !isAppSupportedChain(walletChainId);

  const triggerLabel = walletOnUnknownChain
    ? getWalletChainShortLabel(walletChainId)
    : config.shortName;

  const handleSelectChain = useCallback(
    (id: SupportedChainId) => {
      if (id === chainId && (!isConnected || walletChainId === id)) {
        return;
      }
      if (!isConnected) {
        setChainId(id);
        return;
      }
      if (!connector) {
        toast.error("No active wallet connection");
        return;
      }
      setIsSwitchPending(true);
      void requestWalletChainSwitch(wagmiConfig, {
        chainId: id,
        connector,
      })
        .then(() => setChainId(id))
        .catch((err: unknown) => toast.error(walletErrorMessage(err)))
        .finally(() => setIsSwitchPending(false));
    },
    [chainId, connector, isConnected, setChainId, wagmiConfig, walletChainId],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 h-8 px-2.5"
          disabled={isSwitchPending}
        >
          {walletOnUnknownChain ? (
            <Globe className="size-[18px] shrink-0 text-muted-foreground" />
          ) : (
            <Image
              src={config.logo}
              alt={config.name}
              width={18}
              height={18}
              className="rounded-full"
            />
          )}
          <span className="text-xs font-medium">{triggerLabel}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_CHAIN_IDS.map((id) => {
          const chain = CHAIN_CONFIGS[id];
          return (
            <DropdownMenuItem
              key={id}
              disabled={isSwitchPending}
              onSelect={() => handleSelectChain(id as SupportedChainId)}
              className="gap-2"
            >
              <Image
                src={chain.logo}
                alt={chain.name}
                width={18}
                height={18}
                className="rounded-full"
              />
              <span className="text-sm">{chain.name}</span>
              {id === chainId && (!isConnected || walletChainId === id) && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
