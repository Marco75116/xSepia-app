"use client";

import { ChevronDown } from "lucide-react";
import Image from "next/image";
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
  SUPPORTED_CHAIN_IDS,
  type SupportedChainId,
} from "@/lib/constants";

export function ChainSwitcher() {
  const { chainId, setChainId, config } = useChain();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 px-2.5">
          <Image
            src={config.logo}
            alt={config.name}
            width={18}
            height={18}
            className="rounded-full"
          />
          <span className="text-xs font-medium">{config.shortName}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_CHAIN_IDS.map((id) => {
          const chain = CHAIN_CONFIGS[id];
          return (
            <DropdownMenuItem
              key={id}
              onClick={() => setChainId(id as SupportedChainId)}
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
              {id === chainId && (
                <span className="ml-auto size-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
