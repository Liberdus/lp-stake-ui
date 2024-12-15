import { atom } from 'jotai';
import { RewardTokenInfo } from '@/types';

export const rewardTokenAtom = atom<RewardTokenInfo>({
  address: '',
  symbol: '',
  decimals: 0,
});