import { desc, eq, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { decodeEventLog, isAddress } from "viem";
import { accountFactoryAbi } from "@/lib/abis/accountFactory";
import { verifyUserAccount } from "@/lib/blockscout";
import { getChainConfig } from "@/lib/constants";
import { getPublicClient, getWalletClient } from "@/lib/viemClient";
import { db } from "@/server/db";
import {
  buyOrders,
  vaultCompositions,
  vaults,
  withdrawOrders,
} from "@/server/db/schema";

export const vaultRoutes = new Elysia()
  .get("/orders", async () => {
    const [buys, withdrawals] = await Promise.all([
      db
        .select({
          id: buyOrders.id,
          vaultId: buyOrders.vaultId,
          ticker: buyOrders.ticker,
          amount: buyOrders.sellAmountUsdc,
          orderUid: buyOrders.orderUid,
          status: buyOrders.status,
          createdAt: buyOrders.createdAt,
        })
        .from(buyOrders)
        .orderBy(desc(buyOrders.createdAt)),
      db
        .select({
          id: withdrawOrders.id,
          vaultId: withdrawOrders.vaultId,
          ticker: withdrawOrders.ticker,
          amount: withdrawOrders.amount,
          txHash: withdrawOrders.txHash,
          status: withdrawOrders.status,
          createdAt: withdrawOrders.createdAt,
        })
        .from(withdrawOrders)
        .orderBy(desc(withdrawOrders.createdAt)),
    ]);

    const allVaults = await db
      .select({ id: vaults.id, name: vaults.name, chainId: vaults.chainId })
      .from(vaults);
    const vaultMap = new Map(
      allVaults.map((v) => [v.id, { name: v.name, chainId: v.chainId }]),
    );

    const unified = [
      ...buys.map((o) => ({
        id: o.id,
        type: "buy" as const,
        vaultName: vaultMap.get(o.vaultId)?.name ?? "Unknown",
        chainId: vaultMap.get(o.vaultId)?.chainId ?? 57073,
        ticker: o.ticker,
        amount: o.amount,
        status: o.status,
        orderUid: o.orderUid,
        txHash: null as string | null,
        createdAt: o.createdAt.toISOString(),
      })),
      ...withdrawals.map((o) => ({
        id: o.id,
        type: "withdraw" as const,
        vaultName: vaultMap.get(o.vaultId)?.name ?? "Unknown",
        chainId: vaultMap.get(o.vaultId)?.chainId ?? 57073,
        ticker: o.ticker,
        amount: o.amount,
        status: o.status,
        orderUid: null as string | null,
        txHash: o.txHash,
        createdAt: o.createdAt.toISOString(),
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return unified;
  })
  .get(
    "/vaults",
    async ({ query }) => {
      const ownerVaults = await db
        .select()
        .from(vaults)
        .where(eq(vaults.owner, query.owner));

      const allCompositions = await db.select().from(vaultCompositions);

      return ownerVaults.map((v) => ({
        id: v.id,
        name: v.name,
        owner: v.owner,
        chainId: v.chainId,
        smartAccountAddress: v.smartAccountAddress,
        strategy: v.strategy,
        dcaFrequency: v.dcaFrequency,
        createdAt: v.createdAt.toISOString(),
        compositions: allCompositions
          .filter((c) => c.vaultId === v.id)
          .map((c) => ({
            ticker: c.ticker,
            tokenAddress: c.tokenAddress,
            weight: c.weight,
          })),
      }));
    },
    {
      query: t.Object({
        owner: t.String(),
      }),
    },
  )
  .get(
    "/vault/:id",
    async ({ params }) => {
      const [vault] = await db
        .select()
        .from(vaults)
        .where(eq(vaults.id, params.id))
        .limit(1);

      if (!vault) {
        throw new Error("Vault not found");
      }

      const compositions = await db
        .select()
        .from(vaultCompositions)
        .where(eq(vaultCompositions.vaultId, vault.id));

      return {
        vault: {
          id: vault.id,
          name: vault.name,
          owner: vault.owner,
          chainId: vault.chainId,
          smartAccountAddress: vault.smartAccountAddress,
          strategy: vault.strategy,
          dcaFrequency: vault.dcaFrequency,
          dcaAmount: vault.dcaAmount,
          createdAt: vault.createdAt.toISOString(),
        },
        compositions: compositions.map((c) => ({
          ticker: c.ticker,
          tokenAddress: c.tokenAddress,
          weight: c.weight,
        })),
      };
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/vault/:id/orders",
    async ({ params }) => {
      const orders = await db
        .select()
        .from(buyOrders)
        .where(eq(buyOrders.vaultId, params.id))
        .orderBy(desc(buyOrders.createdAt));

      return orders.map((o) => ({
        id: o.id,
        ticker: o.ticker,
        tokenAddress: o.tokenAddress,
        sellAmountUsdc: o.sellAmountUsdc,
        orderUid: o.orderUid,
        status: o.status,
        error: o.error,
        createdAt: o.createdAt.toISOString(),
      }));
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/vault/:id/withdrawals",
    async ({ params }) => {
      const orders = await db
        .select()
        .from(withdrawOrders)
        .where(eq(withdrawOrders.vaultId, params.id))
        .orderBy(desc(withdrawOrders.createdAt));

      return orders.map((o) => ({
        id: o.id,
        ticker: o.ticker,
        tokenAddress: o.tokenAddress,
        amount: o.amount,
        txHash: o.txHash,
        status: o.status,
        createdAt: o.createdAt.toISOString(),
      }));
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .post(
    "/vault",
    async ({ body }) => {
      const {
        owner,
        name,
        chainId,
        allocations,
        strategy,
        dcaFrequency,
        dcaAmount,
      } = body;

      if (!isAddress(owner)) {
        throw new Error("Invalid owner address");
      }

      const chainConfig = getChainConfig(chainId);

      const dcaFrequencySeconds: Record<string, number> = {
        daily: 86400,
        weekly: 604800,
        monthly: 2592000,
      };

      const [{ max: maxSalt }] = await db
        .select({ max: sql<number>`coalesce(max(${vaults.saltIndex}), -1)` })
        .from(vaults)
        .where(eq(vaults.owner, owner));
      const saltIndex = BigInt(maxSalt + 1);

      const config = {
        tokens: allocations.map((a) => a.tokenAddress as `0x${string}`),
        allocations: allocations.map((a) => BigInt(a.weight)),
        dcaAmount: dcaAmount ? BigInt(Math.floor(dcaAmount * 1e6)) : BigInt(0),
        dcaFrequency: dcaFrequency
          ? BigInt(dcaFrequencySeconds[dcaFrequency] ?? 0)
          : BigInt(0),
      };

      const walletClient = getWalletClient(chainConfig.chainId);
      const client = getPublicClient(chainConfig.chainId);

      const txHash = await walletClient.writeContract({
        address: chainConfig.accountFactory,
        abi: accountFactoryAbi,
        functionName: "createAccount",
        args: [owner, saltIndex, config],
      });

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
      });

      let smartAccountAddress: string | undefined;

      const log = receipt.logs.find(
        (l) =>
          l.address.toLowerCase() === chainConfig.accountFactory.toLowerCase(),
      );

      if (log) {
        const decoded = decodeEventLog({
          abi: accountFactoryAbi,
          data: log.data,
          topics: log.topics,
        });
        smartAccountAddress = (decoded.args as { account: string }).account;
      }

      if (smartAccountAddress) {
        verifyUserAccount(
          smartAccountAddress,
          owner as `0x${string}`,
          chainConfig.chainId,
        ).catch(() => {});
      }

      const [vault] = await db
        .insert(vaults)
        .values({
          name,
          owner,
          chainId: chainConfig.chainId,
          saltIndex: Number(saltIndex),
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
          chainId: vault.chainId,
          smartAccountAddress: vault.smartAccountAddress,
        },
      };
    },
    {
      body: t.Object({
        owner: t.String(),
        name: t.String(),
        chainId: t.Number(),
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
