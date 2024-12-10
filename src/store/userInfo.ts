import { atom } from 'jotai';

export interface UserInfo {
  address: string | null;
  isConnected: boolean;
  isAdmin: boolean;
  stakeInfo: any;
}

export const userInfoAtom = atom<UserInfo>({
  address: null,
  isConnected: false,
  isAdmin: false,
  stakeInfo: null,
});
