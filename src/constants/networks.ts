export const TARGET_CHAIN_ID = 31337;

const CHAIN_CONFIGS = {
  31337: {
    chainId: `0x${(31337).toString(16)}`,
    chainName: 'Hardhat',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH', 
      decimals: 18,
    },
    rpcUrls: ['http://localhost:8545'],
  },
  80002: {
    chainId: `0x${(80002).toString(16)}`,
    chainName: 'Polygon Amoy',
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
    rpcUrls: ['https://rpc-amoy.polygon.technology'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
  137: {
    chainId: `0x${(137).toString(16)}`,
    chainName: 'Polygon Mainnet', 
    nativeCurrency: {
      name: 'POL',
      symbol: 'POL',
      decimals: 18,
    },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  }
};

export const TARGET_CHAIN = CHAIN_CONFIGS[TARGET_CHAIN_ID];

export const switchNetwork = async () => {
  if (!window.ethereum) return false;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: TARGET_CHAIN.chainId }]
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [TARGET_CHAIN]
        });
        return true;
      } catch (addError) {
        console.error('Error adding network:', addError);
        return false;
      }
    }
    console.error('Error switching network:', error);
    return false;
  }
};
