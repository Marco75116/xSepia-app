"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAccount, useConfig } from "wagmi";
import {
  getChainId,
  getConnection,
  watchAccount,
  watchConnection,
} from "wagmi/actions";
import {
  DEFAULT_CHAIN_ID,
  getChainConfig,
  isAppSupportedChain,
  type SupportedChainId,
} from "@/lib/constants";

const CHAIN_DEBUG_LOG =
  process.env.NEXT_PUBLIC_DEBUG_CHAIN === "1" ||
  process.env.NODE_ENV === "development";

type ChainContextValue = {
  chainId: SupportedChainId;
  walletChainId: number | undefined;
  setChainId: (chainId: SupportedChainId) => void;
  config: ReturnType<typeof getChainConfig>;
};

const ChainContext = createContext<ChainContextValue | null>(null);

export function ChainProvider({ children }: { children: React.ReactNode }) {
  const [chainId, setChainIdState] =
    useState<SupportedChainId>(DEFAULT_CHAIN_ID);
  const chainIdRef = useRef(chainId);
  chainIdRef.current = chainId;

  const wagmiConfig = useConfig();
  const { isConnected, chainId: connectionChainId } = useAccount();

  const setChainId = useCallback((id: SupportedChainId) => {
    setChainIdState(id);
  }, []);

  useEffect(() => {
    if (!CHAIN_DEBUG_LOG || typeof window === "undefined") return;

    const log = (reason: string) => {
      const conn = getConnection(wagmiConfig);
      console.log(`[xstocks chain] ${reason}`, {
        status: conn.status,
        wagmiConnectionChainId: conn.chainId,
        wagmiStoreChainId: getChainId(wagmiConfig),
        appSelectChainId: chainIdRef.current,
        isConnected: conn.isConnected,
        address: conn.address,
      });
    };

    log("mount");

    const unwatchConnection = watchConnection(wagmiConfig, {
      onChange(data) {
        log(`connection:${data.status}`);
      },
    });

    const unwatchAccount = watchAccount(wagmiConfig, {
      onChange(account) {
        log(`account:chain=${account.chainId ?? "none"}`);
      },
    });

    return () => {
      unwatchConnection();
      unwatchAccount();
    };
  }, [wagmiConfig]);

  useEffect(() => {
    if (
      !isConnected ||
      connectionChainId === undefined ||
      !isAppSupportedChain(connectionChainId)
    ) {
      return;
    }
    setChainIdState(connectionChainId);
  }, [isConnected, connectionChainId]);

  const config = getChainConfig(chainId);

  return (
    <ChainContext.Provider
      value={{ chainId, walletChainId: connectionChainId, setChainId, config }}
    >
      {children}
    </ChainContext.Provider>
  );
}

export function useChain() {
  const context = useContext(ChainContext);
  if (!context) {
    throw new Error("useChain must be used within a ChainProvider");
  }
  return context;
}
