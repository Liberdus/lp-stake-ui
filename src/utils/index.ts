export const truncateAddress = (address: string) => {
  return address.slice(0, 8) + '...' + address.slice(-8);
};

export const calcAPR = (dailyRate: number, tvl: number, lpTokenPrice: number, rewardTokenPrice: number) => {
  if (tvl === 0) return 0;
  if (!lpTokenPrice || !rewardTokenPrice) return (dailyRate * 365) / tvl || 0;
  return (dailyRate * rewardTokenPrice * 365) / (tvl * lpTokenPrice) || 0;
};

export const fetchTokenPrice = async (address: string) => {
  const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
  const data = await response.json();
  return data.pairs?.[0]?.priceUsd;
};