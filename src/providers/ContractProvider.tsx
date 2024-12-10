import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import LPStakingContractABI from '@/assets/abi/LPStaking.json';
import { useEthersSigner } from '@/hooks/useEthersSigner';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT_ADDRESS as string;

interface ContractContextType {
  contract: ethers.Contract | null;
  isLoading: boolean;
  error: Error | null;
}

const ContractContext = createContext<ContractContextType>({
  contract: null,
  isLoading: true,
  error: null,
});

export const useContract = () => useContext(ContractContext);

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const provider = useEthersProvider();
  const signer = useEthersSigner();

  useEffect(() => {
    const initContract = async () => {
      if (!provider) {
        setIsLoading(false);
        return;
      }

      try {
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, LPStakingContractABI.abi, signer);

        setContract(stakingContract);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize contract'));
      } finally {
        setIsLoading(false);
      }
    };

    initContract();
  }, [provider, signer]);

  return <ContractContext.Provider value={{ contract, isLoading, error }}>{children}</ContractContext.Provider>;
};
