import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { base, Chain, mainnet, polygon, polygonAmoy, sepolia } from 'wagmi/chains';

const hardhat = {
  id: 31337,
  name: 'Hardhat',
  nativeCurrency: { name: 'Hardhat', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
} as const satisfies Chain;

export const config = getDefaultConfig({
  appName: 'RainbowKit App',
  projectId: 'YOUR_PROJECT_ID',
  chains: [mainnet, polygon, base, ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [sepolia, hardhat, polygonAmoy] : [])],
  ssr: true,
});
