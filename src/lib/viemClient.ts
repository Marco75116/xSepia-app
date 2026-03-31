import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ink } from "viem/chains";

export const publicClient = createPublicClient({
  chain: ink,
  transport: http(),
});

const operatorAccount = privateKeyToAccount(
  process.env.OPERATOR_PRIVATE_KEY as `0x${string}`,
);

export const walletClient = createWalletClient({
  account: operatorAccount,
  chain: ink,
  transport: http(),
});
