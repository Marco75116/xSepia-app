import { Elysia, t } from "elysia";
import { decodeEventLog, isAddress } from "viem";
import { accountFactoryAbi } from "@/lib/abis/accountFactory";
import { getChainConfig } from "@/lib/constants";
import { getPublicClient, getWalletClient } from "@/lib/viemClient";

export const accountRoutes = new Elysia().post(
  "/account",
  async ({ body }) => {
    const { owner, chainId } = body;

    if (!isAddress(owner)) {
      throw new Error("Invalid owner address");
    }

    const chainConfig = getChainConfig(chainId);
    const walletClient = getWalletClient(chainConfig.chainId);
    const client = getPublicClient(chainConfig.chainId);

    let txHash: `0x${string}`;
    try {
      txHash = await walletClient.writeContract({
        address: chainConfig.accountFactory,
        abi: accountFactoryAbi,
        functionName: "createAccount",
        args: [
          owner,
          BigInt(0),
          {
            tokens: [],
            allocations: [],
            dcaAmount: BigInt(0),
            dcaFrequency: BigInt(0),
          },
        ],
      });
    } catch (err) {
      console.error("[account] createAccount tx failed:", err);
      throw new Error("Account creation transaction failed");
    }

    const receipt = await client.waitForTransactionReceipt({
      hash: txHash,
    });

    const log = receipt.logs.find(
      (l) =>
        l.address.toLowerCase() === chainConfig.accountFactory.toLowerCase(),
    );

    let accountAddress: string | undefined;
    if (log) {
      const decoded = decodeEventLog({
        abi: accountFactoryAbi,
        data: log.data,
        topics: log.topics,
      });
      accountAddress = (decoded.args as { account: string }).account;
    }

    if (!accountAddress) {
      console.error("[account] No AccountCreated event found in tx:", txHash);
    }

    return { txHash, accountAddress };
  },
  {
    body: t.Object({
      owner: t.String(),
      chainId: t.Number(),
    }),
  },
);
