import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ethers } from 'ethers';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import LPStaking_ABI from '@/assets/abi/LPStaking.json';
import UNIV2_ABI from '@/assets/abi/UNI-V2.json';
import LIBERC20_ABI from '@/assets/abi/LIBERC20.json';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { SCPairData, TokenInfo } from '@/types';
import { useAtom } from 'jotai';
import { rewardTokenAtom } from '@/store/rewardToken';
import ERC20_ABI from '@/assets/abi/ERC20.json';
import { ContractEvent } from '@/types';
import useNotification from '@/hooks/useNotification';
import useAlert from '@/hooks/useAlert';

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT_ADDRESS as string;
const REWARD_TOKEN_ADDRESS = import.meta.env.VITE_REWARD_TOKEN_ADDRESS as string;

interface ContractContextType {
  contract: ethers.Contract | null;
  rewardTokenContract: ethers.Contract | null;
  isLoading: boolean;
  error: Error | null;
  // Core staking functions
  stake: (lpToken: string, amount: string) => Promise<void>;
  unstake: (lpToken: string, amount: string) => Promise<void>;
  claimRewards: (lpToken: string) => Promise<void>;

  // Propose functions
  proposeSetHourlyRewardRate: (newRate: string) => Promise<void>;
  proposeUpdatePairWeights: (lpTokens: string[], weights: string[]) => Promise<void>;
  proposeAddPair: (lpToken: string, pairName: string, platform: string, weight: string) => Promise<void>;
  proposeRemovePair: (lpToken: string) => Promise<void>;
  proposeChangeSigner: (oldSigner: string, newSigner: string) => Promise<void>;
  proposeWithdrawRewards: (recipient: string, amount: string) => Promise<void>;
  approveAction: (actionId: number) => Promise<void>;
  executeAction: (actionId: number) => Promise<void>;

  // User info
  getPendingRewards: (userAddress: string, lpToken: string) => Promise<number>;
  getUserStakeInfo: (
    userAddress: string,
    lpToken: string
  ) => Promise<{
    amount: bigint;
    pendingRewards: bigint;
    lastRewardTime: bigint;
  }>;

  // Pair info
  getPairInfo: (lpToken: string) => Promise<{
    token: string;
    platform: string;
    weight: bigint;
    isActive: boolean;
  }>;
  getPairs: () => Promise<SCPairData[]>;

  // Contract state
  getHourlyRewardRate: () => Promise<bigint>;
  getTotalWeight: () => Promise<bigint>;
  getMaxWeight: () => Promise<number>;
  getRequiredApprovals: () => Promise<number>;
  getRewardToken: () => Promise<string>;
  getSigners: () => Promise<string[]>;
  getActionCounter: () => Promise<number>;
  getActions: (actionId: number) => Promise<any>;
  getTVL: (lpToken: string) => Promise<bigint>;
  getContractAddress: () => Promise<string>;
  hasAdminRole: (address: string) => Promise<boolean>;
  // Token info
  getTokenInfo: (address: string) => Promise<TokenInfo>;
  getERC20Balance: (address: string, tokenAddress: string) => Promise<bigint>;

  // Action info
  getActionApproval: (actionId: number) => Promise<string[]>;
  getActionPairs: (actionId: number) => Promise<string[]>;
  getActionWeights: (actionId: number) => Promise<string[]>;

  // Events
  getEvents: () => ContractEvent[];
}

const ContractContext = createContext<ContractContextType>({
  contract: null,
  rewardTokenContract: null,
  isLoading: true,
  error: null,
  stake: async () => {},
  unstake: async () => {},
  claimRewards: async () => {},
  proposeSetHourlyRewardRate: async () => {},
  proposeUpdatePairWeights: async () => {},
  proposeAddPair: async () => {},
  proposeRemovePair: async () => {},
  proposeChangeSigner: async () => {},
  proposeWithdrawRewards: async () => {},
  approveAction: async () => {},
  executeAction: async () => {},
  getPendingRewards: async () => 0,
  getUserStakeInfo: async () => ({ amount: BigInt(0), pendingRewards: BigInt(0), lastRewardTime: BigInt(0) }),
  getPairInfo: async () => ({ token: '', platform: '', weight: BigInt(0), isActive: false }),
  getPairs: async () => [],
  getHourlyRewardRate: async () => BigInt(0),
  getContractAddress: async () => '',
  getMaxWeight: async () => 0,
  getRequiredApprovals: async () => 0,
  getTotalWeight: async () => BigInt(0),
  getRewardToken: async () => '',
  getSigners: async () => [],
  getActionCounter: async () => 0,
  getActions: async () => [],
  getTVL: async () => BigInt(0),
  hasAdminRole: async () => false,
  getTokenInfo: async () => ({ address: '', symbol: '', decimals: 0 }),
  getERC20Balance: async () => BigInt(0),
  getActionApproval: async () => [],
  getActionPairs: async () => [],
  getActionWeights: async () => [],
  getEvents: () => [],
});

export const useContract = () => useContext(ContractContext);

interface ContractProviderProps {
  children: ReactNode;
}

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [rewardTokenContract, setRewardTokenContract] = useState<ethers.Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [rewardToken, setRewardToken] = useAtom(rewardTokenAtom);
  const [events, setEvents] = useState<ContractEvent[]>([]);

  const { showNotification } = useNotification();
  const { showAlert } = useAlert();
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  useEffect(() => {
    if (error !== null) {
      showNotification('error', error?.message || '');
      setError(null);
    }
  }, [JSON.stringify(error)]);

  useEffect(() => {
    const initContract = async () => {
      if (!provider || !signer) {
        setIsLoading(false);
        return;
      }

      try {
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, LPStaking_ABI, provider);
        const rewardTokenContract = new ethers.Contract(REWARD_TOKEN_ADDRESS, LIBERC20_ABI, provider);
        setContract(stakingContract.connect(signer) as ethers.Contract);
        setRewardTokenContract(rewardTokenContract.connect(signer) as ethers.Contract);
        setError(null);
      } catch (err) {
        setError(new Error('Failed to initialize contract'));
      } finally {
        setIsLoading(false);
      }
    };

    initContract();
  }, [provider, signer]);

  useEffect(() => {
    const getRewardToken = async () => {
      if (!rewardTokenContract) return;
      try {
        const symbol = await rewardTokenContract.symbol();
        const decimals = await rewardTokenContract.decimals();
        setRewardToken({
          address: REWARD_TOKEN_ADDRESS,
          symbol: symbol,
          decimals: decimals,
        });
      } catch (err) {
      }
    };
    getRewardToken();
  }, [rewardTokenContract]);

  // Add event listeners when the contract is ready
  useEffect(() => {
    if (!contract) return;

    // Example: Listening to StakeAdded, StakeRemoved, RewardsClaimed events
    const onStakeAdded = (user: string, lpToken: string, amount: bigint, event: ethers.EventLog) => {
      addEvent('StakeAdded', [user, lpToken, amount], event);
    };

    const onStakeRemoved = (user: string, lpToken: string, amount: bigint, event: ethers.EventLog) => {
      addEvent('StakeRemoved', [user, lpToken, amount], event);
    };

    const onRewardsClaimed = (user: string, lpToken: string, amount: bigint, event: ethers.EventLog) => {
      addEvent('RewardsClaimed', [user, lpToken, amount], event);
    };

    // Attach listeners
    contract.on('StakeAdded', onStakeAdded);
    contract.on('StakeRemoved', onStakeRemoved);
    contract.on('RewardsClaimed', onRewardsClaimed);

    // Cleanup function to remove listeners on unmount or contract change
    return () => {
      contract.off('StakeAdded', onStakeAdded);
      contract.off('StakeRemoved', onStakeRemoved);
      contract.off('RewardsClaimed', onRewardsClaimed);
    };
  }, [contract]);

  const addEvent = (eventName: string, args: any[], event: ethers.EventLog) => {
    const newEvent: ContractEvent = {
      eventName,
      args,
      transactionHash: event.transactionHash || '',
      blockNumber: event.blockNumber,
    };
    if(newEvent.eventName === 'StakeAdded') {
      const userAddress = newEvent.args[0];
      const lpToken = newEvent.args[1];
      const amount = newEvent.args[2];
      if(userAddress === signer?.getAddress()) {
        showAlert(`Staked ${amount} ${lpToken}`, 'info');
      }
    } else if(newEvent.eventName === 'StakeRemoved') {
      const userAddress = newEvent.args[0];
      const lpToken = newEvent.args[1];
      const amount = newEvent.args[2];
      if(userAddress === signer?.getAddress()) {
        showAlert(`Unstaked ${amount} ${lpToken}`, 'info');
      }
    } else if(newEvent.eventName === 'RewardsClaimed') {
      const userAddress = newEvent.args[0];
      const lpToken = newEvent.args[1];
      const amount = newEvent.args[2];
      if(userAddress === signer?.getAddress()) {
        showAlert(`Claimed ${amount} ${lpToken}`, 'info');
      }
    }
    setEvents((prev) => [newEvent, ...prev]);
  };

  // Core staking functions
  const stake = async (lpToken: string, amount: string) => {
    try {
      if (!contract || !signer) throw new Error('Contract not initialized');
      const tokenContract = new ethers.Contract(lpToken, ERC20_ABI, signer);
      
      // Check allowance first
      const currentAllowance = await tokenContract.allowance(await signer.getAddress(), STAKING_CONTRACT_ADDRESS);
      const amountInWei = ethers.parseEther(amount);
      
      // Only approve if needed
      if (currentAllowance < amountInWei) {
        const approveTx = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amountInWei);
        await approveTx.wait();
      }

      // Proceed with staking
      const tx = await contract.stake(lpToken, amountInWei);
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to stake';
      setError(new Error(errorMessage));
    }
  };

  const unstake = async (lpToken: string, amount: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.unstake(lpToken, ethers.parseEther(amount));
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to unstake';
      setError(new Error(errorMessage));
    }
  };

  const claimRewards = async (lpToken: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.claimRewards(lpToken);
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to claim rewards';
      setError(new Error(errorMessage));
    }
  };

  // Propose functions
  const proposeSetHourlyRewardRate = async (newRate: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.proposeSetHourlyRewardRate(ethers.parseEther(newRate));
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to propose set hourly reward rate';
      setError(new Error(errorMessage));
    }
  };

  const proposeUpdatePairWeights = async (lpTokens: string[], weights: string[]) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const weightsInWei = weights.map((w) => ethers.parseEther(w));
      const tx = await contract.proposeUpdatePairWeights(lpTokens, weightsInWei);
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to propose update pair weights';
      setError(new Error(errorMessage));
    }
  };

  const proposeAddPair = async (lpToken: string, pairName: string, platform: string, weight: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.proposeAddPair(lpToken, pairName, platform, ethers.parseEther(weight));
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to propose add pair';
      setError(new Error(errorMessage));
    }
  };

  const proposeRemovePair = async (lpToken: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.proposeRemovePair(lpToken);
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to propose remove pair';
      setError(new Error(errorMessage));
    }
  };

  const proposeChangeSigner = async (oldSigner: string, newSigner: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.proposeChangeSigner(oldSigner, newSigner);
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to propose change signer';
      setError(new Error(errorMessage));
    }
  };

  const proposeWithdrawRewards = async (recipient: string, amount: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.proposeWithdrawRewards(recipient, ethers.parseUnits(amount, rewardToken.decimals));
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to propose withdraw rewards';
      setError(new Error(errorMessage));
    }
  };

  const approveAction = async (actionId: number) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.approveAction(actionId);
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to approve action';
      setError(new Error(errorMessage));
    }
  };

  const executeAction = async (actionId: number) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const tx = await contract.executeAction(actionId);
      await tx.wait();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to execute action';
      setError(new Error(errorMessage));
    }
  };

  const getPendingRewards = async (userAddress: string, lpToken: string) => {
    try {
      if (!contract || !provider || !rewardTokenContract) throw new Error('Contract not initialized');
      return await contract.earned(userAddress, lpToken);
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get pending rewards';
      setError(new Error(errorMessage));
      return 0;
    }
  };

  // User info
  const getUserStakeInfo = async (userAddress: string, lpToken: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const [amount, pendingRewards, lastRewardTime] = await contract.getUserStakeInfo(userAddress, lpToken);
      return { amount, pendingRewards, lastRewardTime };
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get user stake info';
      setError(new Error(errorMessage));
      return { amount: BigInt(0), pendingRewards: BigInt(0), lastRewardTime: BigInt(0) };
    }
  };

  // Pair info
  const getPairInfo = async (lpToken: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const [token, platform, weight, isActive] = await contract.pairs(lpToken);
      return { token, platform, weight, isActive };
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get pair info';
      setError(new Error(errorMessage));
      return { token: '', platform: '', weight: BigInt(0), isActive: false };
    }
  };

  const getPairs = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getPairs();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get pairs';
      setError(new Error(errorMessage));
      return [];
    }
  };

  // Contract state
  const getAdminRole = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.ADMIN_ROLE();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get admin role';
      setError(new Error(errorMessage));
      return '';
    }
  };

  const hasAdminRole = async (address: string) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      const adminRole = await getAdminRole();
      return await contract.hasRole(adminRole, address);
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to check role';
      setError(new Error(errorMessage));
      return false;
    }
  };

  const getContractAddress = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getAddress();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get contract address';
      setError(new Error(errorMessage));
      return '';
    }
  };

  const getMaxWeight = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return Number(ethers.formatEther(await contract.MAX_WEIGHT()));
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get max weight';
      setError(new Error(errorMessage));
      return 0;
    }
  };

  const getRequiredApprovals = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.REQUIRED_APPROVALS();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get required approvals';
      setError(new Error(errorMessage));
      return BigInt(0);
    }
  };

  const getHourlyRewardRate = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.hourlyRewardRate();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get hourly reward rate';
      setError(new Error(errorMessage));
      return BigInt(0);
    }
  };

  const getTotalWeight = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.totalWeight();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get total weight';
      setError(new Error(errorMessage));
      return BigInt(0);
    }
  };

  const getRewardToken = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.rewardToken();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get reward token';
      setError(new Error(errorMessage));
      return '';
    }
  };

  const getSigners = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getSigners();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get signers';
      setError(new Error(errorMessage));
      return [];
    }
  };

  const getActions = async (actionId: number) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.actions(BigInt(actionId));
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get actions';
      setError(new Error(errorMessage));
      return [];
    }
  };

  const getActionCounter = async () => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.actionCounter();
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get action counter';
      setError(new Error(errorMessage));
      return BigInt(0);
    }
  };

  const getTVL = async (lpToken: string) => {
    try {
      if (!contract || !provider) throw new Error('Contract not initialized');
      const univ2Contract = new ethers.Contract(lpToken, UNIV2_ABI, provider);
      const balance = await univ2Contract.balanceOf(STAKING_CONTRACT_ADDRESS);
      return balance;
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get TVL';
      setError(new Error(errorMessage));
      return BigInt(0);
    }
  };

  const getERC20Balance = async (address: string, tokenAddress: string) => {
    try {
      if (!provider) throw new Error('Provider not initialized');
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
      const balance = await tokenContract.balanceOf(address);
      return balance;
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get ERC20 balance';
      setError(new Error(errorMessage));
      return BigInt(0);
    }
  };

  const getTokenInfo = async (address: string) => {
    try {
      if (!provider) throw new Error('Provider not initialized');
      const tokenContract = new ethers.Contract(address, ERC20_ABI, provider);
      const symbol = await tokenContract.symbol();
      const decimals = await tokenContract.decimals();
      return { address, symbol, decimals };
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get token info';
      setError(new Error(errorMessage));
      return { address: '', symbol: '', decimals: 0 };
    }
  };

  const getActionApproval = async (actionId: number) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getActionApproval(actionId);
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get action approval';
      setError(new Error(errorMessage));
      return [];
    }
  };

  const getActionPairs = async (actionId: number) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getActionPairs(actionId);
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get action pairs';
      setError(new Error(errorMessage));
      return [];
    }
  };

  const getActionWeights = async (actionId: number) => {
    try {
      if (!contract) throw new Error('Contract not initialized');
      return await contract.getActionWeights(actionId);
    } catch (err: any) {
      const errorMessage = err.reason || 'Failed to get action weights';
      setError(new Error(errorMessage));
      return [];
    }
  };

  const getEvents = () => events;

  return (
    <ContractContext.Provider
      value={{
        contract,
        rewardTokenContract,
        isLoading,
        error,
        // Core staking functions
        stake,
        unstake,
        claimRewards,
        // Propose functions
        proposeSetHourlyRewardRate,
        proposeUpdatePairWeights,
        proposeAddPair,
        proposeRemovePair,
        proposeChangeSigner,
        proposeWithdrawRewards,
        approveAction,
        executeAction,
        // User info
        getUserStakeInfo,
        getPendingRewards,
        // Pair info
        getPairInfo,
        getPairs,
        // Contract state
        getHourlyRewardRate,
        getMaxWeight,
        getRequiredApprovals,
        getTotalWeight,
        getRewardToken,
        getSigners,
        getActionCounter,
        getActions,
        getTVL,
        hasAdminRole,
        // Token info
        getTokenInfo,
        getERC20Balance,
        // Action info
        getActionApproval,
        getActionPairs,
        getActionWeights,
        // Events
        getEvents,
        getContractAddress,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
