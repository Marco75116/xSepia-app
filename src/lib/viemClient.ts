import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ink, mainnet } from "viem/chains";
import type { SupportedChainId } from "@/lib/constants";

const chains = {
  57073: ink,
  1: mainnet,
} as const;

export const publicClient = createPublicClient({
  chain: ink,
  transport: http(),
});

export const ethPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export function getPublicClient(chainId: SupportedChainId) {
  return chainId === 1 ? ethPublicClient : publicClient;
}

export function getWalletClient(chainId: SupportedChainId = 57073) {
  const operatorAccount = privateKeyToAccount(
    process.env.OPERATOR_PRIVATE_KEY as `0x${string}`,
  );
  return createWalletClient({
    account: operatorAccount,
    chain: chains[chainId],
    transport: http(),
  });
}
