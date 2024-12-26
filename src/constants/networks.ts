export const TARGET_CHAIN_ID = 80002;

export const POLYGON_AMOY = {
  chainId: `0x${(80002).toString(16)}`,
  chainName: 'Polygon Amoy',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: ['https://rpc-amoy.polygon.technology'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
};

export const POLYGON_MAINNET = {
  chainId: `0x${(137).toString(16)}`,
  chainName: 'Polygon Mainnet',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18,
  },
  rpcUrls: ['https://polygon-rpc.com/'],
  blockExplorerUrls: ['https://polygonscan.com/'],
};

export const TARGET_CHAIN = TARGET_CHAIN_ID === 80002 ? POLYGON_AMOY : POLYGON_MAINNET;

export const switchNetwork = async () => {
  try {
    await window.ethereum?.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: TARGET_CHAIN.chainId }],
    });
    return true;
  } catch (error: any) {
    if (error.code === 4902) {
      try {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [TARGET_CHAIN],
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
