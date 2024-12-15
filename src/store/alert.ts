import { atom } from 'jotai';

interface IAlert {
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
}

export const alertAtom = atom<IAlert | null>(null);
