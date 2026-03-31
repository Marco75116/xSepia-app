import type { Address } from "viem";

export const COW_SETTLEMENT_ADDRESS =
  "0x9008D19f58AAbD9eD0D60971565AA8510560ab41" as const;

export const COW_API_BASE_URL = "https://api.cow.fi/ink/api/v1" as const;

export const USDC_ADDRESS =
  "0x2D270e6886d130D724215A266106e6832161EAEd" as const;

export const MIN_SELL_AMOUNT = BigInt(10_000_000);

export const GPV2_ORDER_TYPES = {
  Order: [
    { name: "sellToken", type: "address" },
    { name: "buyToken", type: "address" },
    { name: "receiver", type: "address" },
    { name: "sellAmount", type: "uint256" },
    { name: "buyAmount", type: "uint256" },
    { name: "validTo", type: "uint32" },
    { name: "appData", type: "bytes32" },
    { name: "feeAmount", type: "uint256" },
    { name: "kind", type: "string" },
    { name: "partiallyFillable", type: "bool" },
    { name: "sellTokenBalance", type: "string" },
    { name: "buyTokenBalance", type: "string" },
  ],
} as const;

export const GPV2_DOMAIN = {
  name: "Gnosis Protocol",
  version: "v2",
  chainId: 57073,
  verifyingContract: COW_SETTLEMENT_ADDRESS,
} as const;

export type GPv2Order = {
  sellToken: Address;
  buyToken: Address;
  receiver: Address;
  sellAmount: bigint;
  buyAmount: bigint;
  validTo: number;
  appData: `0x${string}`;
  feeAmount: bigint;
  kind: string;
  partiallyFillable: boolean;
  sellTokenBalance: string;
  buyTokenBalance: string;
};

type CowApiOrder = {
  sellToken: string;
  buyToken: string;
  receiver: string;
  sellAmount: string;
  buyAmount: string;
  validTo: number;
  appData: string;
  feeAmount: string;
  kind: "sell";
  partiallyFillable: boolean;
  sellTokenBalance: "erc20";
  buyTokenBalance: "erc20";
  signature: string;
  signingScheme: "eip1271";
  from: string;
};

const ORDER_VALIDITY_SECONDS = 1200;

export function buildOrder(params: {
  userAccountAddress: Address;
  buyToken: Address;
  sellAmount: bigint;
}): GPv2Order {
  return {
    sellToken: USDC_ADDRESS,
    buyToken: params.buyToken,
    receiver: params.userAccountAddress,
    sellAmount: params.sellAmount,
    buyAmount: BigInt(1),
    validTo: Math.floor(Date.now() / 1000) + ORDER_VALIDITY_SECONDS,
    appData:
      "0x0000000000000000000000000000000000000000000000000000000000000000",
    feeAmount: BigInt(0),
    kind: "sell",
    partiallyFillable: false,
    sellTokenBalance: "erc20",
    buyTokenBalance: "erc20",
  };
}

export function orderToApiPayload(
  order: GPv2Order,
  signature: string,
  from: Address,
): CowApiOrder {
  return {
    sellToken: order.sellToken,
    buyToken: order.buyToken,
    receiver: order.receiver,
    sellAmount: order.sellAmount.toString(),
    buyAmount: order.buyAmount.toString(),
    validTo: order.validTo,
    appData: order.appData,
    feeAmount: order.feeAmount.toString(),
    kind: "sell",
    partiallyFillable: order.partiallyFillable,
    sellTokenBalance: "erc20",
    buyTokenBalance: "erc20",
    signature,
    signingScheme: "eip1271",
    from,
  };
}
