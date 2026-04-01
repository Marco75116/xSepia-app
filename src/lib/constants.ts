import type { Address } from "viem";

export type SupportedChainId = 1 | 57073;

export type ChainConfig = {
  chainId: SupportedChainId;
  name: string;
  shortName: string;
  accountFactory: Address;
  operator: Address;
  usdc: Address;
  swapRelayer: Address;
  explorerUrl: string;
  swapProtocol: "cow" | "1inch";
  logo: string;
};

export const CHAIN_CONFIGS: Record<SupportedChainId, ChainConfig> = {
  57073: {
    chainId: 57073,
    name: "Ink Mainnet",
    shortName: "Ink",
    accountFactory: "0x0144029bc9Db2D1b13d9216cad7870d567f08Fda",
    operator: "0xB351edfb846d7c26Aed130c2DE66151c1efF5236",
    usdc: "0x2D270e6886d130D724215A266106e6832161EAEd",
    swapRelayer: "0xC92E8bdf79f0507f65a392b0ab4667716BFE0110",
    explorerUrl: "https://explorer.inkonchain.com",
    swapProtocol: "cow",
    logo: "/chains/ink.svg",
  },
  1: {
    chainId: 1,
    name: "Ethereum",
    shortName: "Ethereum",
    accountFactory: "0x52ce41F6B4e95b6891F93Ad85165b525412e1362",
    operator: "0xB351edfb846d7c26Aed130c2DE66151c1efF5236",
    usdc: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    swapRelayer: "0x111111125421cA6dc452d289314280a0f8842A65",
    explorerUrl: "https://etherscan.io",
    swapProtocol: "1inch",
    logo: "/chains/ethereum.svg",
  },
};

export const SUPPORTED_CHAIN_IDS: SupportedChainId[] = [57073, 1];
export const DEFAULT_CHAIN_ID: SupportedChainId = 57073;

export function getChainConfig(chainId: number): ChainConfig {
  const config = CHAIN_CONFIGS[chainId as SupportedChainId];
  if (!config) {
    throw new Error(`Unsupported chain: ${chainId}`);
  }
  return config;
}

export const OPERATOR_ADDRESS =
  "0xB351edfb846d7c26Aed130c2DE66151c1efF5236" as const;
