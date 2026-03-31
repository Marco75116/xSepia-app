import { createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [coinbaseWallet({ appName: "xStocks" })],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
