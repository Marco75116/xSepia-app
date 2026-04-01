import { createConfig, http } from "wagmi";
import { ink } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [ink],
  connectors: [coinbaseWallet({ appName: "xStocks" })],
  transports: {
    [ink.id]: http(),
  },
});
