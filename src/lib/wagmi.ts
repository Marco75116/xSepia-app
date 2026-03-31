import { createConfig, http } from "wagmi";
import { base, mainnet } from "wagmi/chains";
import { coinbaseWallet, injected } from "wagmi/connectors";

export const config = createConfig({
  chains: [mainnet, base],
  connectors: [injected(), coinbaseWallet({ appName: "xStocks" })],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
  },
});
