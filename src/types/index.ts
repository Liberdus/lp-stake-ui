interface UserInfo {
  address: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  stakeInfo: any;
}

interface SCPairData {
  lpToken: string;
  pairName: string;
  platform: string;
  weight: bigint;
  isActive: boolean;
}

interface PairInfo {
  lpToken: string;
  pairName: string;
  platform: string;
  weight: bigint;
  isActive: boolean;
  apr: number;
  tvl: number;
  myShare: number;
  myEarnings: number;
}

interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

interface UserStakeInfo {
  amount: bigint;
  pendingRewards: bigint;
  lastRewardTime: bigint;
}

interface ContractEvent {
  eventName: string;
  args: any[];
  transactionHash: string;
  blockNumber: number;
  blockTimestamp?: number;
}

export type { UserInfo, PairInfo, SCPairData, UserStakeInfo, TokenInfo, ContractEvent };
