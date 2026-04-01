"use client";

import { createContext, useCallback, useContext, useState } from "react";
import {
  DEFAULT_CHAIN_ID,
  getChainConfig,
  type SupportedChainId,
} from "@/lib/constants";

type ChainContextValue = {
  chainId: SupportedChainId;
  setChainId: (chainId: SupportedChainId) => void;
  config: ReturnType<typeof getChainConfig>;
};

const ChainContext = createContext<ChainContextValue | null>(null);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [chainId, setChainIdState] =
    useState<SupportedChainId>(DEFAULT_CHAIN_ID);

  const setChainId = useCallback((id: SupportedChainId) => {
    setChainIdState(id);
  }, []);

  const config = getChainConfig(chainId);

  return (
    <ChainContext value={{ chainId, setChainId, config }}>
      {children}
    </ChainContext>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error("useChain must be used within a ChainProvider");
  }
  return context;
}
