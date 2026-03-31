import { Elysia, t } from "elysia";
import { decodeEventLog, isAddress } from "viem";
import { accountFactoryAbi } from "@/lib/abis/accountFactory";
import { ACCOUNT_FACTORY_ADDRESS } from "@/lib/constants";
import { getWalletClient, publicClient } from "@/lib/viemClient";

export const accountRoutes = new Elysia().post(
  "/account",
  async ({ body }) => {
    const { owner } = body;

    if (!isAddress(owner)) {
      throw new Error("Invalid owner address");
    }

    let txHash: `0x${string}`;
    try {
      txHash = await getWalletClient().writeContract({
        address: ACCOUNT_FACTORY_ADDRESS,
        abi: accountFactoryAbi,
        functionName: "createAccount",
        args: [owner],
      });
    } catch (err) {
      console.error("[account] createAccount tx failed:", err);
      throw new Error("Account creation transaction failed");
    }

    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });

    const log = receipt.logs.find(
      (l) => l.address.toLowerCase() === ACCOUNT_FACTORY_ADDRESS.toLowerCase(),
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
    }),
  },
);
