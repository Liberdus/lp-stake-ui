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

interface LPTokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

interface RewardTokenInfo {
  address: string;
  symbol: string;
  decimals: number;
}

interface UserStakeInfo {
  amount: bigint;
  pendingRewards: bigint;
  lastRewardTime: bigint;
}

export type { UserInfo, PairInfo, SCPairData, LPTokenInfo, UserStakeInfo, RewardTokenInfo };
