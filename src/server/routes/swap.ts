import { Elysia, t } from "elysia";
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

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

const validBuyTokens = new Set(
  STOCKS.filter((s) => s.address !== ZERO_ADDRESS).map((s) =>
    s.address.toLowerCase(),
  ),
);

export const swapRoutes = new Elysia().post(
  "/swap",
  async ({ body }) => {
    const { userAccountAddress, buyToken, sellAmount: sellAmountRaw } = body;

    if (!isAddress(userAccountAddress)) {
      throw new Error("Invalid userAccountAddress");
    }

    if (!isAddress(buyToken)) {
      throw new Error("Invalid buyToken address");
    }

    if (!validBuyTokens.has(buyToken.toLowerCase())) {
      throw new Error("buyToken is not a supported stock token");
    }

    const sellAmount = BigInt(sellAmountRaw);
    if (sellAmount < MIN_SELL_AMOUNT) {
      throw new Error("sellAmount must be at least 10 USDC (10000000)");
    }

    const order = buildOrder({
      userAccountAddress: userAccountAddress as `0x${string}`,
      buyToken: buyToken as `0x${string}`,
      sellAmount,
    });

    let signature: string;
    try {
      signature = await getWalletClient().signTypedData({
        domain: GPV2_DOMAIN,
        types: GPV2_ORDER_TYPES,
        primaryType: "Order",
        message: order,
      });
    } catch (err) {
      console.error("[swap] Failed to sign order:", err);
      throw new Error("Order signing failed");
    }

    const payload = orderToApiPayload(
      order,
      signature,
      userAccountAddress as `0x${string}`,
    );

    const response = await fetch(`${COW_API_BASE_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[swap] CoW API error (${response.status}):`, errorBody);
      let description = "CoW API order submission failed";
      try {
        const parsed = JSON.parse(errorBody) as { description?: string };
        if (parsed.description) description = parsed.description;
      } catch {}
      throw new Error(description);
    }

    const orderUid = (await response.json()) as string;
    return { orderUid };
  },
  {
    body: t.Object({
      userAccountAddress: t.String(),
      buyToken: t.String(),
      sellAmount: t.String(),
    }),
  },
);
