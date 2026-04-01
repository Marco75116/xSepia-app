import type { Address } from "viem";

export const ONEINCH_ROUTER_ADDRESS =
  "0x111111125421cA6dc452d289314280a0f8842A65" as const;

export const ETH_USDC_ADDRESS =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as const;

export const MIN_SELL_AMOUNT = BigInt(10_000_000);

export const ONEINCH_ORDER_TYPES = {
  Order: [
    { name: "salt", type: "uint256" },
    { name: "maker", type: "address" },
    { name: "receiver", type: "address" },
    { name: "makerAsset", type: "address" },
    { name: "takerAsset", type: "address" },
    { name: "makingAmount", type: "uint256" },
    { name: "takingAmount", type: "uint256" },
    { name: "makerTraits", type: "uint256" },
  ],
} as const;

export const ONEINCH_DOMAIN = {
  name: "1inch Aggregation Router",
  version: "6",
  chainId: 1,
  verifyingContract: ONEINCH_ROUTER_ADDRESS,
} as const;

export type OneInchOrder = {
  salt: bigint;
  maker: Address;
  receiver: Address;
  makerAsset: Address;
  takerAsset: Address;
  makingAmount: bigint;
  takingAmount: bigint;
  makerTraits: bigint;
};

const ORDER_VALIDITY_SECONDS = 1200;

function packMakerTraits(params: {
  expiry: number;
  noPartialFills: boolean;
}): bigint {
  let traits = BigInt(0);
  traits |= BigInt(params.expiry) << BigInt(80);
  if (params.noPartialFills) {
    traits |= BigInt(1) << BigInt(255);
  }
  return traits;
}

export function buildOneInchOrder(params: {
  userAccountAddress: Address;
  buyToken: Address;
  sellAmount: bigint;
}): OneInchOrder {
  const expiry = Math.floor(Date.now() / 1000) + ORDER_VALIDITY_SECONDS;
  const salt = BigInt(
    `0x${Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")}`,
  );

  return {
    salt,
    maker: params.userAccountAddress,
    receiver: params.userAccountAddress,
    makerAsset: ETH_USDC_ADDRESS,
    takerAsset: params.buyToken,
    makingAmount: params.sellAmount,
    takingAmount: BigInt(1),
    makerTraits: packMakerTraits({
      expiry,
      noPartialFills: true,
    }),
  };
}

type OneInchApiOrder = {
  orderHash: string;
  signature: string;
  data: {
    salt: string;
    maker: string;
    receiver: string;
    makerAsset: string;
    takerAsset: string;
    makingAmount: string;
    takingAmount: string;
    makerTraits: string;
  };
};

export function orderToApiPayload(
  order: OneInchOrder,
  signature: string,
  orderHash: string,
): OneInchApiOrder {
  return {
    orderHash,
    signature,
    data: {
      salt: order.salt.toString(),
      maker: order.maker,
      receiver: order.receiver,
      makerAsset: order.makerAsset,
      takerAsset: order.takerAsset,
      makingAmount: order.makingAmount.toString(),
      takingAmount: order.takingAmount.toString(),
      makerTraits: order.makerTraits.toString(),
    },
  };
}
