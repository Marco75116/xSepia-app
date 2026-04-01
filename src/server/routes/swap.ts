import { Elysia, t } from "elysia";
import { type Address, hashTypedData, isAddress } from "viem";
import { getChainConfig } from "@/lib/constants";
import {
  buildOrder,
  COW_API_BASE_URL,
  GPV2_DOMAIN,
  GPV2_ORDER_TYPES,
  MIN_SELL_AMOUNT,
  orderToApiPayload,
} from "@/lib/cow";
import { STOCKS } from "@/lib/data/stocks";
import {
  buildOneInchOrder,
  ONEINCH_DOMAIN,
  ONEINCH_ORDER_TYPES,
  orderToApiPayload as oneInchOrderToPayload,
} from "@/lib/oneinch";
import { getWalletClient } from "@/lib/viemClient";
import { db } from "@/server/db";
import { buyOrder } from "@/server/db/schema";

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

async function submitCowOrder(
  userAccountAddress: Address,
  buyToken: Address,
  sellAmount: bigint,
): Promise<OrderResult> {
  const order = buildOrder({ userAccountAddress, buyToken, sellAmount });

  let signature: string;
  try {
    signature = await getWalletClient(57073).signTypedData({
      domain: GPV2_DOMAIN,
      types: GPV2_ORDER_TYPES,
      primaryType: "Order",
      message: order,
    });
  } catch (err) {
    console.error(`[swap] Failed to sign CoW order for ${buyToken}:`, err);
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
  console.info(`[swap] CoW order submitted for ${buyToken}: ${orderUid}`);
  return { buyToken, orderUid };
}

async function submitOneInchOrder(
  userAccountAddress: Address,
  buyToken: Address,
  sellAmount: bigint,
): Promise<OrderResult> {
  const order = buildOneInchOrder({
    userAccountAddress,
    buyToken,
    sellAmount,
  });

  let signature: string;
  try {
    signature = await getWalletClient(1).signTypedData({
      domain: ONEINCH_DOMAIN,
      types: ONEINCH_ORDER_TYPES,
      primaryType: "Order",
      message: order,
    });
  } catch (err) {
    console.error(`[swap] Failed to sign 1inch order for ${buyToken}:`, err);
    return { buyToken, error: "Order signing failed" };
  }

  const orderHash = hashTypedData({
    domain: ONEINCH_DOMAIN,
    types: ONEINCH_ORDER_TYPES,
    primaryType: "Order",
    message: order,
  });

  const payload = oneInchOrderToPayload(order, signature, orderHash);

  const apiKey = process.env.ONEINCH_API_KEY;
  if (!apiKey) {
    console.error("[swap] 1inch API key not configured");
    return { buyToken, error: "1inch API key not configured" };
  }

  const response = await fetch("https://api.1inch.dev/orderbook/v4.2/1", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[swap] 1inch API error for ${buyToken} (${response.status}):`,
      errorBody,
    );
    let description = "1inch API order submission failed";
    try {
      const parsed = JSON.parse(errorBody) as { description?: string };
      if (parsed.description) description = parsed.description;
    } catch {}
    return { buyToken, error: description };
  }

  const result = (await response.json()) as { orderHash?: string };
  const uid = result.orderHash ?? orderHash;
  console.info(`[swap] 1inch order submitted for ${buyToken}: ${uid}`);
  return { buyToken, orderUid: uid };
}

export const swapRoutes = new Elysia().post(
  "/swap",
  async ({ body }) => {
    const { userAccountAddress, vaultId, chainId, orders } = body;

    console.info(
      `[swap] POST /swap — vaultId=${vaultId}, chainId=${chainId}, orders=${orders.length}, account=${userAccountAddress}`,
    );

    if (!isAddress(userAccountAddress)) {
      console.error(`[swap] Invalid userAccountAddress: ${userAccountAddress}`);
      throw new Error("Invalid userAccountAddress");
    }

    if (orders.length === 0) {
      console.error("[swap] Empty orders array");
      throw new Error("orders array must not be empty");
    }

    const chainConfig = getChainConfig(chainId);

    for (const o of orders) {
      if (!isAddress(o.buyToken)) {
        console.error(`[swap] Invalid buyToken address: ${o.buyToken}`);
        throw new Error(`Invalid buyToken address: ${o.buyToken}`);
      }
      if (
        chainConfig.chainId === 57073 &&
        !validBuyTokens.has(o.buyToken.toLowerCase())
      ) {
        console.error(`[swap] Unsupported stock token: ${o.buyToken}`);
        throw new Error(
          `buyToken is not a supported stock token: ${o.buyToken}`,
        );
      }
      const sellAmount = BigInt(o.sellAmount);
      if (sellAmount < MIN_SELL_AMOUNT) {
        console.error(
          `[swap] sellAmount too low for ${o.buyToken}: ${o.sellAmount}`,
        );
        throw new Error(
          `sellAmount must be at least 10 USDC (10000000) for ${o.buyToken}`,
        );
      }
    }

    const submitOrder =
      chainConfig.swapProtocol === "cow" ? submitCowOrder : submitOneInchOrder;

    console.info(
      `[swap] Submitting ${orders.length} orders via ${chainConfig.swapProtocol}...`,
    );

    const results = await Promise.all(
      orders.map((o) =>
        submitOrder(
          userAccountAddress as Address,
          o.buyToken as Address,
          BigInt(o.sellAmount),
        ),
      ),
    );

    const now = String(Date.now());
    const dbRows = results.map((r, i) => {
      const sellAmountUsdc = (
        Number(BigInt(orders[i].sellAmount)) / 1e6
      ).toFixed(2);
      const ticker =
        tickerByAddress.get(orders[i].buyToken.toLowerCase()) ??
        orders[i].buyToken;

      return {
        id: crypto.randomUUID(),
        vaultId,
        ticker,
        tokenAddress: orders[i].buyToken,
        sellAmountUsdc,
        orderUid: r.orderUid ?? null,
        status: r.orderUid ? "submitted" : "failed",
        error: r.error ?? null,
        chainId: chainConfig.chainId,
        createdAt: now,
      };
    });

    console.info(`[swap] Inserting ${dbRows.length} buy orders into DB...`);
    await db.insert(buyOrder).values(dbRows);

    const succeeded = results.filter((r) => r.orderUid).length;
    const failed = results.length - succeeded;
    console.info(
      `[swap] POST /swap done — ${succeeded} succeeded, ${failed} failed`,
    );

    return { results };
  },
  {
    body: t.Object({
      userAccountAddress: t.String(),
      vaultId: t.String(),
      chainId: t.Number(),
      orders: t.Array(
        t.Object({
          buyToken: t.String(),
          sellAmount: t.String(),
        }),
      ),
    }),
  },
);
