import { desc, eq, inArray, sql } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { decodeEventLog, isAddress } from "viem";
import { accountFactoryAbi } from "@/lib/abis/accountFactory";
import { verifyUserAccount } from "@/lib/blockscout";
import { getChainConfig } from "@/lib/constants";
import { getPublicClient, getWalletClient } from "@/lib/viemClient";
import { db } from "@/server/db";
import {
  buyOrder,
  sellOrder,
  vault,
  vaultComposition,
  withdrawOrder,
} from "@/server/db/schema";

export const vaultRoutes = new Elysia()
  .get("/orders", async () => {
    console.info("[vault] GET /orders — fetching all orders");

    const [buys, withdrawals, sells, allVaults] = await Promise.all([
      db
        .select({
          id: buyOrder.id,
          vaultId: buyOrder.vaultId,
          ticker: buyOrder.ticker,
          sellAmountUsdc: buyOrder.sellAmountUsdc,
          orderUid: buyOrder.orderUid,
          status: buyOrder.status,
          chainId: buyOrder.chainId,
          createdAt: buyOrder.createdAt,
        })
        .from(buyOrder)
        .orderBy(desc(buyOrder.createdAt)),
      db
        .select({
          id: withdrawOrder.id,
          vaultId: withdrawOrder.vaultId,
          ticker: withdrawOrder.ticker,
          amount: withdrawOrder.amount,
          txHash: withdrawOrder.txHash,
          status: withdrawOrder.status,
          chainId: withdrawOrder.chainId,
          createdAt: withdrawOrder.createdAt,
        })
        .from(withdrawOrder)
        .orderBy(desc(withdrawOrder.createdAt)),
      db
        .select({
          id: sellOrder.id,
          vaultId: sellOrder.vaultId,
          ticker: sellOrder.ticker,
          sellAmount: sellOrder.sellAmount,
          orderUid: sellOrder.orderUid,
          status: sellOrder.status,
          chainId: sellOrder.chainId,
          createdAt: sellOrder.createdAt,
        })
        .from(sellOrder)
        .orderBy(desc(sellOrder.createdAt)),
      db
        .select({ id: vault.id, name: vault.name, chainId: vault.chainId })
        .from(vault),
    ]);

    console.info(
      `[vault] GET /orders — found ${buys.length} buys, ${withdrawals.length} withdrawals, ${sells.length} sells, ${allVaults.length} vaults`,
    );

    const vaultMap = new Map(
      allVaults.map((v) => [v.id, { name: v.name, chainId: v.chainId }]),
    );

    const unified = [
      ...buys.map((o) => ({
        id: o.id,
        type: "buy" as const,
        vaultName: vaultMap.get(o.vaultId)?.name ?? "Unknown",
        chainId: o.chainId,
        ticker: o.ticker,
        amount: String(o.sellAmountUsdc),
        status: o.status,
        orderUid: o.orderUid,
        txHash: null as string | null,
        createdAt: String(o.createdAt),
      })),
      ...withdrawals.map((o) => ({
        id: o.id,
        type: "withdraw" as const,
        vaultName: vaultMap.get(o.vaultId)?.name ?? "Unknown",
        chainId: o.chainId,
        ticker: o.ticker,
        amount: String(o.amount),
        status: o.status,
        orderUid: null as string | null,
        txHash: o.txHash,
        createdAt: String(o.createdAt),
      })),
      ...sells.map((o) => ({
        id: o.id,
        type: "sell" as const,
        vaultName: vaultMap.get(o.vaultId)?.name ?? "Unknown",
        chainId: o.chainId,
        ticker: o.ticker,
        amount: String(o.sellAmount),
        status: o.status,
        orderUid: o.orderUid,
        txHash: null as string | null,
        createdAt: String(o.createdAt),
      })),
    ].sort((a, b) => Number(BigInt(b.createdAt) - BigInt(a.createdAt)));

    console.info(
      `[vault] GET /orders — returning ${unified.length} unified orders`,
    );
    return unified;
  })
  .get(
    "/vaults",
    async ({ query }) => {
      console.info(`[vault] GET /vaults — owner=${query.owner}`);

      const ownerVaults = await db
        .select()
        .from(vault)
        .where(eq(vault.owner, query.owner));

      if (ownerVaults.length === 0) {
        console.info(
          `[vault] GET /vaults — no vaults found for ${query.owner}`,
        );
        return [];
      }

      const vaultIds = ownerVaults.map((v) => v.id);
      const compositions = await db
        .select()
        .from(vaultComposition)
        .where(inArray(vaultComposition.vaultId, vaultIds));

      const result = ownerVaults.map((v) => ({
        id: v.id,
        name: v.name,
        owner: v.owner,
        chainId: v.chainId,
        smartAccountAddress: v.smartAccountAddress,
        strategy: v.strategy,
        dcaFrequency: v.dcaFrequency,
        signalQuestion: v.signalQuestion,
        signalThreshold: v.signalThreshold,
        signalAction: v.signalAction,
        createdAt: String(v.createdAt),
        compositions: compositions
          .filter((c) => c.vaultId === v.id)
          .map((c) => ({
            ticker: c.ticker,
            tokenAddress: c.tokenAddress,
            weight: c.weight,
          })),
      }));

      console.info(
        `[vault] GET /vaults — returning ${result.length} vaults for ${query.owner}`,
      );
      return result;
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
      console.info(`[vault] GET /vault/${params.id}`);

      const [found] = await db
        .select()
        .from(vault)
        .where(eq(vault.id, params.id))
        .limit(1);

      if (!found) {
        console.error(`[vault] GET /vault/${params.id} — not found`);
        throw new Error("Vault not found");
      }

      const compositions = await db
        .select()
        .from(vaultComposition)
        .where(eq(vaultComposition.vaultId, found.id));

      console.info(
        `[vault] GET /vault/${params.id} — found, ${compositions.length} compositions`,
      );

      return {
        vault: {
          id: found.id,
          name: found.name,
          owner: found.owner,
          chainId: found.chainId,
          smartAccountAddress: found.smartAccountAddress,
          strategy: found.strategy,
          dcaFrequency: found.dcaFrequency,
          dcaAmount: found.dcaAmount ? String(found.dcaAmount) : null,
          signalId: found.signalId,
          signalQuestion: found.signalQuestion,
          signalThreshold: found.signalThreshold,
          signalAction: found.signalAction,
          createdAt: String(found.createdAt),
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
      console.info(`[vault] GET /vault/${params.id}/orders`);

      const orders = await db
        .select()
        .from(buyOrder)
        .where(eq(buyOrder.vaultId, params.id))
        .orderBy(desc(buyOrder.createdAt));

      console.info(
        `[vault] GET /vault/${params.id}/orders — ${orders.length} orders`,
      );

      return orders.map((o) => ({
        id: o.id,
        ticker: o.ticker,
        tokenAddress: o.tokenAddress,
        sellAmountUsdc: String(o.sellAmountUsdc),
        orderUid: o.orderUid,
        status: o.status,
        error: o.error,
        createdAt: String(o.createdAt),
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
      console.info(`[vault] GET /vault/${params.id}/withdrawals`);

      const orders = await db
        .select()
        .from(withdrawOrder)
        .where(eq(withdrawOrder.vaultId, params.id))
        .orderBy(desc(withdrawOrder.createdAt));

      console.info(
        `[vault] GET /vault/${params.id}/withdrawals — ${orders.length} orders`,
      );

      return orders.map((o) => ({
        id: o.id,
        ticker: o.ticker,
        tokenAddress: o.tokenAddress,
        amount: String(o.amount),
        txHash: o.txHash,
        status: o.status,
        createdAt: String(o.createdAt),
      }));
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    },
  )
  .get(
    "/vault/:id/sells",
    async ({ params }) => {
      console.info(`[vault] GET /vault/${params.id}/sells`);

      const orders = await db
        .select()
        .from(sellOrder)
        .where(eq(sellOrder.vaultId, params.id))
        .orderBy(desc(sellOrder.createdAt));

      console.info(
        `[vault] GET /vault/${params.id}/sells — ${orders.length} orders`,
      );

      return orders.map((o) => ({
        id: o.id,
        ticker: o.ticker,
        tokenAddress: o.tokenAddress,
        sellAmount: String(o.sellAmount),
        orderUid: o.orderUid,
        status: o.status,
        error: o.error,
        createdAt: String(o.createdAt),
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
        signalId,
        signalQuestion,
        signalThreshold,
        signalAction,
      } = body;

      console.info(
        `[vault] POST /vault — owner=${owner}, name=${name}, chainId=${chainId}, strategy=${strategy}, allocations=${allocations.length}`,
      );

      if (!isAddress(owner)) {
        console.error(`[vault] POST /vault — invalid owner address: ${owner}`);
        throw new Error("Invalid owner address");
      }

      const chainConfig = getChainConfig(chainId);

      const dcaFrequencySeconds: Record<string, number> = {
        daily: 86400,
        weekly: 604800,
        monthly: 2592000,
      };

      const [{ max: maxSalt }] = await db
        .select({
          max: sql<number>`coalesce(max(${vault.saltIndex}), -1)`,
        })
        .from(vault)
        .where(eq(vault.owner, owner));

      const walletClient = getWalletClient(chainConfig.chainId);
      const client = getPublicClient(chainConfig.chainId);

      let saltIndex = BigInt(Math.max(maxSalt + 1, 10));

      for (let attempt = 0; attempt < 20; attempt++) {
        const hasAcc = await client.readContract({
          address: chainConfig.accountFactory,
          abi: accountFactoryAbi,
          functionName: "hasAccount",
          args: [owner as `0x${string}`, saltIndex],
        });
        if (!hasAcc) break;
        console.info(
          `[vault] POST /vault — saltIndex=${saltIndex} already deployed on-chain, trying next`,
        );
        saltIndex += BigInt(1);
      }

      console.info(`[vault] POST /vault — saltIndex=${saltIndex}`);

      const config = {
        tokens: allocations.map((a) => a.tokenAddress as `0x${string}`),
        allocations: allocations.map((a) => BigInt(a.weight)),
        dcaAmount: dcaAmount ? BigInt(Math.floor(dcaAmount * 1e6)) : BigInt(0),
        dcaFrequency: dcaFrequency
          ? BigInt(dcaFrequencySeconds[dcaFrequency] ?? 0)
          : BigInt(0),
      };

      console.info("[vault] POST /vault — sending createAccount tx...");
      let txHash: `0x${string}`;
      try {
        txHash = await walletClient.writeContract({
          address: chainConfig.accountFactory,
          abi: accountFactoryAbi,
          functionName: "createAccount",
          args: [owner, saltIndex, config],
        });
      } catch (err) {
        console.error(
          "[vault] POST /vault — createAccount tx failed:",
          err instanceof Error ? err.message : err,
        );
        if (err instanceof Error && "details" in err) {
          console.error(
            "[vault] POST /vault — tx error details:",
            (err as unknown as { details: unknown }).details,
          );
        }
        if (err instanceof Error && "cause" in err) {
          console.error("[vault] POST /vault — tx error cause:", err.cause);
        }
        throw err;
      }
      console.info(`[vault] POST /vault — tx sent: ${txHash}`);

      const receipt = await client.waitForTransactionReceipt({
        hash: txHash,
      });
      console.info(
        `[vault] POST /vault — tx confirmed, status=${receipt.status}, block=${receipt.blockNumber}`,
      );

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
        console.info(
          `[vault] POST /vault — smart account deployed: ${smartAccountAddress}`,
        );
      } else {
        console.error(
          "[vault] POST /vault — no AccountCreated event found in tx logs",
        );
      }

      if (smartAccountAddress) {
        verifyUserAccount(
          smartAccountAddress,
          owner as `0x${string}`,
          chainConfig.chainId,
        ).catch((err) => {
          console.error(
            "[vault] POST /vault — blockscout verification failed:",
            err instanceof Error ? err.message : err,
          );
        });
      }

      const vaultId = crypto.randomUUID();
      const now = String(Date.now());

      console.info(`[vault] POST /vault — inserting vault id=${vaultId}`);
      const [inserted] = await db
        .insert(vault)
        .values({
          id: vaultId,
          name,
          owner,
          chainId: chainConfig.chainId,
          saltIndex: Number(saltIndex),
          smartAccountAddress: smartAccountAddress ?? null,
          strategy,
          dcaFrequency: strategy === "dca" ? (dcaFrequency ?? null) : null,
          dcaAmount:
            strategy === "dca" && dcaAmount
              ? String(Math.floor(dcaAmount * 1e6))
              : null,
          signalId: signalId ?? null,
          signalQuestion: signalQuestion ?? null,
          signalThreshold: signalThreshold ?? null,
          signalAction: signalAction ?? null,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
      console.info(`[vault] POST /vault — vault inserted: ${inserted.id}`);

      if (allocations.length > 0) {
        console.info(
          `[vault] POST /vault — inserting ${allocations.length} compositions`,
        );
        await db.insert(vaultComposition).values(
          allocations.map((a) => ({
            id: crypto.randomUUID(),
            vaultId,
            ticker: a.ticker,
            tokenAddress: a.tokenAddress,
            weight: a.weight,
            chainId: chainConfig.chainId,
            createdAt: now,
          })),
        );
        console.info("[vault] POST /vault — compositions inserted");
      }

      return {
        vault: {
          id: inserted.id,
          name: inserted.name,
          chainId: inserted.chainId,
          smartAccountAddress: inserted.smartAccountAddress,
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
        signalId: t.Optional(t.String()),
        signalQuestion: t.Optional(t.String()),
        signalThreshold: t.Optional(t.Number()),
        signalAction: t.Optional(t.String()),
      }),
    },
  );
