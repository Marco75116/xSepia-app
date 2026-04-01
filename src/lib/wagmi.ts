import { createConfig, http } from "wagmi";
import { ink, mainnet } from "wagmi/chains";
import { coinbaseWallet } from "wagmi/connectors";

export const config = createConfig({
  chains: [ink, mainnet],
  connectors: [coinbaseWallet({ appName: "Xodds" })],
  transports: {
    [ink.id]: http(),
    [mainnet.id]: http(),
  },
});
