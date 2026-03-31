import { createConfig, http } from "wagmi";
import { base, ink, mainnet } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, base, ink],
  connectors: [coinbaseWallet({ appName: "xStocks" })],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [ink.id]: http(),
  },
});
