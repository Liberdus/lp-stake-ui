import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useContract } from './ContractProvider';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { userInfoAtom } from '@/store/userInfo';
import { useAtom } from 'jotai';

interface AuthContextType {
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthContextProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthContextProps) => {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [isAdmin, setIsAdmin] = useState(false);
  const { contract, hasAdminRole } = useContract();
  const signer = useEthersSigner();

  useEffect(() => {
    const setAdmin = async () => {
      if (contract && signer) {
        const isAdmin = await hasAdminRole(signer.address);
        setUserInfo({
          ...userInfo,
          isAdmin: isAdmin,
        });
        setIsAdmin(isAdmin);
      }
    };
    setAdmin();
  }, [contract, signer]);

  return <AuthContext.Provider value={{ isAdmin }}>{children}</AuthContext.Provider>;
};
