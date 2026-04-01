import { Elysia, t } from "elysia";
import { db } from "@/server/db";
import { withdrawOrders } from "@/server/db/schema";

export const withdrawRoutes = new Elysia().post(
  "/withdraw",
  async ({ body }) => {
    const { vaultId, ticker, tokenAddress, amount, txHash } = body;

    const [order] = await db
      .insert(withdrawOrders)
      .values({
        vaultId,
        ticker,
        tokenAddress,
        amount,
        txHash,
        status: "pending",
      })
      .returning();

    return { order };
  },
  {
    body: t.Object({
      vaultId: t.String(),
      ticker: t.String(),
      tokenAddress: t.String(),
      amount: t.String(),
      txHash: t.Optional(t.String()),
    }),
  },
);
