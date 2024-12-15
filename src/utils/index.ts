export const truncateAddress = (address: string) => {
  return address.slice(0, 8) + '...' + address.slice(-8);
};

export const calcAPR = (dailyRate: number, tvl: number) => {
  return (dailyRate * 365) / tvl || 0;
};
