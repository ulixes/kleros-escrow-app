import { createConfig, http } from 'wagmi';
import { arbitrum, mainnet, gnosis } from 'wagmi/chains';
import { injected, walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [mainnet, arbitrum, gnosis],
  connectors: [
    injected(),
    walletConnect({
      projectId: 'YOUR_PROJECT_ID', // Replace with your WalletConnect project ID
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [gnosis.id]: http(),
  },
});