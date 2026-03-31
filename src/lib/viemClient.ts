import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { ink } from "viem/chains";

export const publicClient = createPublicClient({
  chain: ink,
  transport: http(),
});

export function getWalletClient() {
  const operatorAccount = privateKeyToAccount(
    process.env.OPERATOR_PRIVATE_KEY as `0x${string}`,
  );
  return createWalletClient({
    account: operatorAccount,
    chain: ink,
    transport: http(),
  });
}
