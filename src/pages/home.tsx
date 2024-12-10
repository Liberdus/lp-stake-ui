import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { userInfoAtom } from '@/store/userInfo';
import { useAtom } from 'jotai';
import { LPStaking, LPStaking__factory } from '@/typechain-types';

const STAKING_CONTRACT_ADDRESS = import.meta.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as string;
const LP_TOKEN_ADDRESS = import.meta.env.NEXT_PUBLIC_LP_TOKEN_ADDRESS as string;
const REWARD_TOKEN_ADDRESS = import.meta.env.NEXT_PUBLIC_REWARD_TOKEN_ADDRESS as string;

const Home: React.FC = () => {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [stakingContract, setStakingContract] = useState<LPStaking | null>(null);
  const [stakeInput, setStakeInput] = useState<string>('0');
  const [withdrawInput, setWithdrawInput] = useState<string>('0');
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);

  useEffect(() => {
    async function init() {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        const contract = LPStaking__factory.connect(STAKING_CONTRACT_ADDRESS, signer);
        setStakingContract(contract);
      }
    }
    init();
  }, []);
  

  useEffect(() => {
    async function checkAdminRole() {
      if (stakingContract && provider) {
        const adminRole = await stakingContract.ADMIN_ROLE();
        const signer = await provider.getSigner();
        const hasAdminRole = await stakingContract.hasRole(adminRole, signer.address);
        setUserInfo({
          ...userInfo,
          isAdmin: hasAdminRole,
        });
      }
    }
    checkAdminRole();
  }, [stakingContract, provider, userInfo]);

  // Contract interactions
  const stake = async (lpToken: string, amount: string) => {
    if (!stakingContract) return;
    const tx = await stakingContract.stake(lpToken, ethers.parseEther(amount));
    await tx.wait();
  };

  const unstake = async (lpToken: string, amount: string) => {
    if (!stakingContract) return;
    const tx = await stakingContract.unstake(lpToken, ethers.parseEther(amount));
    await tx.wait();
  };

  const claimRewards = async (lpToken: string) => {
    if (!stakingContract) return;
    const tx = await stakingContract.claimRewards(lpToken);
    await tx.wait();
  };

  // UI functions
  const handleStake = async () => {
    if (stakeInput !== '0') {
      await stake(LP_TOKEN_ADDRESS, stakeInput);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawInput !== '0') {
      await unstake(LP_TOKEN_ADDRESS, withdrawInput);
    }
  };

  const handleClaim = async () => {
    await claimRewards(LP_TOKEN_ADDRESS);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Welcome to LIB LP Staking</h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-2 gap-4 text-lg">
            <p className="flex items-center">
              <span className="font-semibold mr-2">Staked Amount:</span>
              LP Tokens
            </p>
            <p className="flex items-center">
              <span className="font-semibold mr-2">Pending Rewards:</span>
              Reward Tokens
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Stake Tokens</h2>
            <input
              type="number"
              value={stakeInput}
              onChange={(e) => setStakeInput(e.target.value)}
              placeholder="Amount to stake"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button onClick={handleStake} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Stake
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Withdraw Tokens</h2>
            <input
              type="number"
              value={withdrawInput}
              onChange={(e) => setWithdrawInput(e.target.value)}
              placeholder="Amount to withdraw"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            />
            <button onClick={handleWithdraw} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              Withdraw
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Claim Rewards</h2>
            <button onClick={handleClaim} className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors mt-[52px]">
              Claim
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
