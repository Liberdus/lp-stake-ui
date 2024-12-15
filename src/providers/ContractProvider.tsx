import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { ethers } from "ethers";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import LPStaking_ABI from "@/assets/abi/LPStaking.json";
import UNIV2_ABI from "@/assets/abi/UNI-V2.json";
import LIBERC20_ABI from "@/assets/abi/LIBERC20.json";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { RewardTokenInfo, SCPairData } from "@/types";
import { useAtom } from "jotai";
import { rewardTokenAtom } from "@/store/rewardToken";
import { lpTokenAtom } from "@/store/lpToken";

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT_ADDRESS as string;
const REWARD_TOKEN_ADDRESS = import.meta.env.VITE_REWARD_TOKEN_ADDRESS as string;

interface ContractContextType {
  contract: ethers.Contract | null;
  isLoading: boolean;
  error: Error | null;
  // Core staking functions
  stake: (lpToken: string, amount: string) => Promise<void>;
  unstake: (lpToken: string, amount: string) => Promise<void>;
  claimRewards: (lpToken: string) => Promise<void>;

  // Propose functions
  proposeSetDailyRewardRate: (newRate: string) => Promise<void>;
  proposeUpdatePairWeights: (lpTokens: string[], weights: string[]) => Promise<void>;
  proposeAddPair: (lpToken: string, pairName: string, platform: string, weight: string) => Promise<void>;
  approveAction: (actionId: number) => Promise<void>;
  executeAction: (actionId: number) => Promise<void>;

  // User info
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
  getDailyRewardRate: () => Promise<bigint>;
  getTotalWeight: () => Promise<bigint>;
  getRewardToken: () => Promise<string>;
  getSigners: () => Promise<string[]>;
  getActionCounter: () => Promise<bigint>;
  getTVL: (lpToken: string) => Promise<bigint>;
}

const ContractContext = createContext<ContractContextType>({
  contract: null,
  isLoading: true,
  error: null,
  stake: async () => {},
  unstake: async () => {},
  claimRewards: async () => {},
  proposeSetDailyRewardRate: async () => {},
  proposeUpdatePairWeights: async () => {},
  proposeAddPair: async () => {},
  approveAction: async () => {},
  executeAction: async () => {},
  getUserStakeInfo: async () => ({ amount: BigInt(0), pendingRewards: BigInt(0), lastRewardTime: BigInt(0) }),
  getPairInfo: async () => ({ token: "", platform: "", weight: BigInt(0), isActive: false }),
  getPairs: async () => [],
  getDailyRewardRate: async () => BigInt(0),
  getTotalWeight: async () => BigInt(0),
  getRewardToken: async () => "",
  getSigners: async () => [],
  getActionCounter: async () => BigInt(0),
  getTVL: async () => BigInt(0),
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
  
  const provider = useEthersProvider();
  const signer = useEthersSigner();

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
        setError(err instanceof Error ? err : new Error("Failed to initialize contract"));
      } finally {
        setIsLoading(false);
      }
    };

    initContract();
  }, [provider, signer]);

  useEffect(() => {
    const getRewardToken = async () => {
      const symbol = await rewardTokenContract?.symbol();
      const decimals = await rewardTokenContract?.decimals();
      setRewardToken({
        address: REWARD_TOKEN_ADDRESS,
        symbol: symbol,
        decimals: decimals,
      });
    };
    getRewardToken();
  }, [rewardTokenContract]);

  // Core staking functions
  const stake = async (lpToken: string, amount: string) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.stake(lpToken, ethers.parseEther(amount));
    await tx.wait();
  };

  const unstake = async (lpToken: string, amount: string) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.unstake(lpToken, ethers.parseEther(amount));
    await tx.wait();
  };

  const claimRewards = async (lpToken: string) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.claimRewards(lpToken);
    await tx.wait();
  };

  // Propose functions
  const proposeSetDailyRewardRate = async (newRate: string) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.proposeSetDailyRewardRate(ethers.parseEther(newRate));
    await tx.wait();
  };

  const proposeUpdatePairWeights = async (lpTokens: string[], weights: string[]) => {
    if (!contract) throw new Error("Contract not initialized");
    const weightsInWei = weights.map((w) => ethers.parseEther(w));
    const tx = await contract.proposeUpdatePairWeights(lpTokens, weightsInWei);
    await tx.wait();
  };

  const proposeAddPair = async (lpToken: string, pairName: string, platform: string, weight: string) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.proposeAddPair(lpToken, pairName, platform, ethers.parseEther(weight));
    await tx.wait();
  };

  const approveAction = async (actionId: number) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.approveAction(actionId);
    await tx.wait();
  };

  const executeAction = async (actionId: number) => {
    if (!contract) throw new Error("Contract not initialized");
    const tx = await contract.executeAction(actionId);
    await tx.wait();
  };

  // User info
  const getUserStakeInfo = async (userAddress: string, lpToken: string) => {
    if (!contract) throw new Error("Contract not initialized");
    const [amount, pendingRewards, lastRewardTime] = await contract.userStakes(userAddress, lpToken);
    return { amount, pendingRewards, lastRewardTime };
  };

  // Pair info
  const getPairInfo = async (lpToken: string) => {
    if (!contract) throw new Error("Contract not initialized");
    const [token, platform, weight, isActive] = await contract.pairs(lpToken);
    return { token, platform, weight, isActive };
  };

  const getPairs = async () => {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.getPairs();
  };

  // Contract state
  const getDailyRewardRate = async () => {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.dailyRewardRate();
  };

  const getTotalWeight = async () => {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.totalWeight();
  };

  const getRewardToken = async () => {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.rewardToken();
  };

  const getSigners = async () => {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.signers();
  };

  const getActionCounter = async () => {
    if (!contract) throw new Error("Contract not initialized");
    return await contract.actionCounter();
  };

  const getTokenInfo = async () => {};

  const getTVL = async (lpToken: string) => {
    if(!contract || !provider) throw new Error("Contract not initialized");
    const univ2Contract = new ethers.Contract(lpToken, UNIV2_ABI, provider);
    const balance = await univ2Contract.balanceOf(STAKING_CONTRACT_ADDRESS);
    return balance;
  };

  const getMyShare = async (address: string) => {};


  const getLPBalance = async (lpToken: string, address: string) => {
    const univ2Contract = new ethers.Contract(lpToken, UNIV2_ABI, provider);
    const balance = await univ2Contract.balanceOf(address);
    return balance;
  };

  const getRewardTokenBalance = async (address: string) => {
    const libERC20Contract = new ethers.Contract(REWARD_TOKEN_ADDRESS, LIBERC20_ABI, provider);
    const balance = await libERC20Contract.balanceOf(address);
    return balance;
  };

  return (
    <ContractContext.Provider
      value={{
        contract,
        isLoading,
        error,
        // Core staking functions
        stake,
        unstake,
        claimRewards,
        // Propose functions
        proposeSetDailyRewardRate,
        proposeUpdatePairWeights,
        proposeAddPair,
        approveAction,
        executeAction,
        // User info
        getUserStakeInfo,
        // Pair info
        getPairInfo,
        getPairs,
        // Contract state
        getDailyRewardRate,
        getTotalWeight,
        getRewardToken,
        getSigners,
        getActionCounter,
        getTVL,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
