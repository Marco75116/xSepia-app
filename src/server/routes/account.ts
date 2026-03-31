import { Elysia, t } from "elysia";
import { decodeEventLog, isAddress } from "viem";
import { accountFactoryAbi } from "@/lib/abis/accountFactory";
import { publicClient, walletClient } from "@/lib/viemClient";

const ACCOUNT_FACTORY_ADDRESS =
  "0x52ce41F6B4e95b6891F93Ad85165b525412e1362" as const;

export const accountRoutes = new Elysia().post(
  "/account",
  async ({ body }) => {
    const { owner } = body;

    if (!isAddress(owner)) {
      throw new Error("Invalid owner address");
    }

    const txHash = await walletClient.writeContract({
      address: ACCOUNT_FACTORY_ADDRESS,
      abi: accountFactoryAbi,
      functionName: "createAccount",
      args: [owner],
    });

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

    return { txHash, accountAddress };
  },
  {
    body: t.Object({
      owner: t.String(),
    }),
  },
);
