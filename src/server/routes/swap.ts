import { Elysia, t } from "elysia";
import type { Address } from "viem";
import { isAddress } from "viem";
import {
  buildOrder,
  COW_API_BASE_URL,
  GPV2_DOMAIN,
  GPV2_ORDER_TYPES,
  MIN_SELL_AMOUNT,
  orderToApiPayload,
} from "@/lib/cow";
import { STOCKS } from "@/lib/data/stocks";
import { getWalletClient } from "@/lib/viemClient";
import { db } from "@/server/db";
import { buyOrders } from "@/server/db/schema";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const validBuyTokens = new Set(
  STOCKS.filter((s) => s.address !== ZERO_ADDRESS).map((s) =>
    s.address.toLowerCase(),
  ),
);

const tickerByAddress = new Map(
  STOCKS.filter((s) => s.address !== ZERO_ADDRESS).map((s) => [
    s.address.toLowerCase(),
    s.ticker,
  ]),
);

type OrderResult = {
  buyToken: string;
  orderUid?: string;
  error?: string;
};

async function submitSingleOrder(
  userAccountAddress: Address,
  buyToken: Address,
  sellAmount: bigint,
): Promise<OrderResult> {
  const order = buildOrder({ userAccountAddress, buyToken, sellAmount });

  let signature: string;
  try {
    signature = await getWalletClient().signTypedData({
      domain: GPV2_DOMAIN,
      types: GPV2_ORDER_TYPES,
      primaryType: "Order",
      message: order,
    });
  } catch (err) {
    console.error(`[swap] Failed to sign order for ${buyToken}:`, err);
    return { buyToken, error: "Order signing failed" };
  }

  const payload = orderToApiPayload(order, signature, userAccountAddress);

  const response = await fetch(`${COW_API_BASE_URL}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[swap] CoW API error for ${buyToken} (${response.status}):`,
      errorBody,
    );
    let description = "CoW API order submission failed";
    try {
      const parsed = JSON.parse(errorBody) as { description?: string };
      if (parsed.description) description = parsed.description;
    } catch {}
    return { buyToken, error: description };
  }

  const orderUid = (await response.json()) as string;
  return { buyToken, orderUid };
}

export const swapRoutes = new Elysia().post(
  "/swap",
  async ({ body }) => {
    const { userAccountAddress, vaultId, orders } = body;

    if (!isAddress(userAccountAddress)) {
      throw new Error("Invalid userAccountAddress");
    }

    if (orders.length === 0) {
      throw new Error("orders array must not be empty");
    }

    for (const o of orders) {
      if (!isAddress(o.buyToken)) {
        throw new Error(`Invalid buyToken address: ${o.buyToken}`);
      }
      if (!validBuyTokens.has(o.buyToken.toLowerCase())) {
        throw new Error(
          `buyToken is not a supported stock token: ${o.buyToken}`,
        );
      }
      const sellAmount = BigInt(o.sellAmount);
      if (sellAmount < MIN_SELL_AMOUNT) {
        throw new Error(
          `sellAmount must be at least 10 USDC (10000000) for ${o.buyToken}`,
        );
      }
    }

    const results = await Promise.all(
      orders.map((o) =>
        submitSingleOrder(
          userAccountAddress as Address,
          o.buyToken as Address,
          BigInt(o.sellAmount),
        ),
      ),
    );

    const dbRows = results.map((r, i) => {
      const sellAmountRaw = BigInt(orders[i].sellAmount);
      const sellAmountUsdc = (Number(sellAmountRaw) / 1e6).toFixed(2);
      const ticker =
        tickerByAddress.get(orders[i].buyToken.toLowerCase()) ??
        orders[i].buyToken;

      return {
        vaultId,
        ticker,
        tokenAddress: orders[i].buyToken,
        sellAmountUsdc,
        orderUid: r.orderUid ?? null,
        status: r.orderUid ? ("submitted" as const) : ("failed" as const),
        error: r.error ?? null,
      };
    });

    await db.insert(buyOrders).values(dbRows);

    return { results };
  },
  {
    body: t.Object({
      userAccountAddress: t.String(),
      vaultId: t.String(),
      orders: t.Array(
        t.Object({
          buyToken: t.String(),
          sellAmount: t.String(),
        }),
      ),
    }),
  },
);
