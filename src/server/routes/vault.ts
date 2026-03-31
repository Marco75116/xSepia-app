import { Elysia, t } from "elysia";
import { decodeEventLog, isAddress } from "viem";
import { accountFactoryAbi } from "@/lib/abis/accountFactory";
import { ACCOUNT_FACTORY_ADDRESS } from "@/lib/constants";
import { getWalletClient, publicClient } from "@/lib/viemClient";
import { db } from "@/server/db";
import { vaultCompositions, vaults } from "@/server/db/schema";

export const vaultRoutes = new Elysia().post(
  "/vault",
  async ({ body }) => {
    const { owner, name, allocations, strategy, dcaFrequency, dcaAmount } =
      body;

    if (!isAddress(owner)) {
      throw new Error("Invalid owner address");
    }

    const hasAccount = await publicClient.readContract({
      address: ACCOUNT_FACTORY_ADDRESS,
      abi: accountFactoryAbi,
      functionName: "hasAccount",
      args: [owner],
    });

    let smartAccountAddress: string | undefined;

    if (hasAccount) {
      const existing = await publicClient.readContract({
        address: ACCOUNT_FACTORY_ADDRESS,
        abi: accountFactoryAbi,
        functionName: "accountOf",
        args: [owner],
      });
      smartAccountAddress = existing as string;
    } else {
      const txHash = await getWalletClient().writeContract({
        address: ACCOUNT_FACTORY_ADDRESS,
        abi: accountFactoryAbi,
        functionName: "createAccount",
        args: [owner],
      });

      const receipt = await publicClient.waitForTransactionReceipt({
        hash: txHash,
      });

      const log = receipt.logs.find(
        (l) =>
          l.address.toLowerCase() === ACCOUNT_FACTORY_ADDRESS.toLowerCase(),
      );

      if (log) {
        const decoded = decodeEventLog({
          abi: accountFactoryAbi,
          data: log.data,
          topics: log.topics,
        });
        smartAccountAddress = (decoded.args as { account: string }).account;
      }
    }

    const [vault] = await db
      .insert(vaults)
      .values({
        name,
        owner,
        smartAccountAddress,
        strategy,
        dcaFrequency: strategy === "dca" ? dcaFrequency : null,
        dcaAmount: strategy === "dca" && dcaAmount ? String(dcaAmount) : null,
      })
      .returning();

    await db.insert(vaultCompositions).values(
      allocations.map((a) => ({
        vaultId: vault.id,
        ticker: a.ticker,
        tokenAddress: a.tokenAddress,
        weight: a.weight,
      })),
    );

    return {
      vault: {
        id: vault.id,
        name: vault.name,
        smartAccountAddress: vault.smartAccountAddress,
      },
    };
  },
  {
    body: t.Object({
      owner: t.String(),
      name: t.String(),
      allocations: t.Array(
        t.Object({
          ticker: t.String(),
          tokenAddress: t.String(),
          weight: t.Number(),
        }),
      ),
      strategy: t.Union([t.Literal("manual"), t.Literal("dca")]),
      dcaFrequency: t.Optional(
        t.Union([
          t.Literal("daily"),
          t.Literal("weekly"),
          t.Literal("monthly"),
        ]),
      ),
      dcaAmount: t.Optional(t.Number()),
    }),
  },
);
