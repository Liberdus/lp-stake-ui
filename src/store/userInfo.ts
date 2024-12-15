import { atom } from 'jotai';
import { UserInfo } from '@/types';

export const userInfoAtom = atom<UserInfo>({
  address: null,
  isConnected: false,
  isAdmin: false,
  stakeInfo: null,
});
