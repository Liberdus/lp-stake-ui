import { atom } from 'jotai';
import { TokenInfo } from '@/types';

export const rewardTokenAtom = atom<TokenInfo>({
  address: '',
  symbol: '',
  decimals: 0,
});