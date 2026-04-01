import { Elysia, t } from "elysia";
import { db } from "@/server/db";
import { withdrawOrder } from "@/server/db/schema";

export const withdrawRoutes = new Elysia().post(
  "/withdraw",
  async ({ body }) => {
    const { vaultId, ticker, tokenAddress, amount, txHash, status, chainId } =
      body;

    console.info(
      `[withdraw] POST /withdraw — vaultId=${vaultId}, ticker=${ticker}, amount=${amount}, chainId=${chainId}, txHash=${txHash ?? "none"}`,
    );

    const now = String(Date.now());

    const [order] = await db
      .insert(withdrawOrder)
      .values({
        id: crypto.randomUUID(),
        vaultId,
        ticker,
        tokenAddress,
        amount,
        txHash: txHash ?? null,
        status: status ?? "pending",
        chainId,
        createdAt: now,
      })
      .returning();

    console.info(
      `[withdraw] POST /withdraw — inserted order id=${order.id}, status=${order.status}`,
    );

    return { order };
  },
  {
    body: t.Object({
      vaultId: t.String(),
      ticker: t.String(),
      tokenAddress: t.String(),
      amount: t.String(),
      chainId: t.Number(),
      txHash: t.Optional(t.String()),
      status: t.Optional(
        t.Union([
          t.Literal("pending"),
          t.Literal("confirmed"),
          t.Literal("failed"),
        ]),
      ),
    }),
  },
);
