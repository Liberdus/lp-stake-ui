import { useEffect, useState } from "react";
import { userInfoAtom } from "@/store/userInfo";
import { useAtom } from "jotai";
import { useEthersSigner } from "@/hooks/useEthersSigner";
import { useEthersProvider } from "@/hooks/useEthersProvider";
import { useContract } from "@/providers/ContractProvider";
import { ethers } from "ethers";
import { truncateAddress } from "@/utils";

interface PairInfo {
  lpToken: string;
  platform: string;
  weight: bigint;
  isActive: boolean;
  apr: number;
  tvl: number;
  myShare: number;
  myEarnings: number;
}

const Home: React.FC = () => {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [pairs, setPairs] = useState<PairInfo[]>([]);
  const [hourlyRewardRate, setHourlyRewardRate] = useState<string>("0");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<PairInfo | null>(null);
  const [stakePercent, setStakePercent] = useState<number>(100);
  const [unstakePercent, setUnstakePercent] = useState<number>(100);
  const [tabValue, setTabValue] = useState(0);

  const { contract, stake, unstake, claimRewards, getPairs, getDailyRewardRate, getUserStakeInfo, getTotalWeight } = useContract();

  const provider = useEthersProvider();
  const signer = useEthersSigner();

  useEffect(() => {
    async function checkAdminRole() {
      if (contract && provider && signer) {
        const adminRole = await contract.ADMIN_ROLE();
        const hasAdminRole = await contract.hasRole(adminRole, signer.address);
        setUserInfo({
          ...userInfo,
          isAdmin: hasAdminRole,
        });
      }
    }
    checkAdminRole();
  }, [contract, provider, userInfo]);

  useEffect(() => {
    async function fetchData() {
      if (contract && provider) {
        try {
          const pairsData = await getPairs();
          const dailyRate = await getDailyRewardRate();
          const totalWeight = await getTotalWeight();

          const pairsInfo: PairInfo[] = await Promise.all(
            pairsData.map(async (pair: any) => {
              const info = await contract.pairs(pair.lpToken);
              let myShare = 0;
              let myEarnings = 0;

              if (signer) {
                const userStake = await getUserStakeInfo(await signer.getAddress(), pair.lpToken);
                myShare = Number(userStake.amount) / 1e18;
                myEarnings = Number(userStake.pendingRewards) / 1e18;
              }

              // Mock TVL and APR calculations - replace with actual calculations
              const tvl = Math.random() * 1000000;
              const apr = info.weight > 0 ? 15 + Math.random() * 5 : 0;

              return {
                lpToken: pair,
                platform: info.platform,
                weight: info.weight,
                isActive: info.isActive,
                apr,
                tvl,
                myShare,
                myEarnings,
              };
            })
          );
          console.log(pairsInfo);
          // Sort pairs by APR (desc) then TVL (desc), zero weight pairs at bottom
          const sortedPairs = pairsInfo.sort((a, b) => {
            if (a.weight === BigInt(0) && b.weight > BigInt(0)) return 1;
            if (b.weight === BigInt(0) && a.weight > BigInt(0)) return -1;
            if (a.apr !== b.apr) return b.apr - a.apr;
            return b.tvl - a.tvl;
          });

          setPairs(sortedPairs);
          setHourlyRewardRate(ethers.formatEther(dailyRate / BigInt(24)));
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
    }
    fetchData();
  }, [contract, provider, signer]);

  const handlePairClick = (pairAddress: string) => {
    window.open(`https://app.uniswap.org/#/add/v2/${pairAddress}`, "_blank");
  };

  const handleShareClick = (pair: PairInfo) => {
    setSelectedPair(pair);
    setIsModalOpen(true);
  };

  const handleStake = async () => {
    if (!selectedPair || stakePercent === 0) return;
    try {
      await stake(selectedPair.lpToken, (stakePercent / 100).toString());
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error staking:", error);
    }
  };

  const handleUnstake = async () => {
    if (!selectedPair || unstakePercent === 0) return;
    try {
      await unstake(selectedPair.lpToken, (unstakePercent / 100).toString());
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error unstaking:", error);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedPair) return;
    try {
      await claimRewards(selectedPair.lpToken);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center my-8">LP Staking</h1>

      <h2 className="text-xl font-semibold mb-4">Hourly Reward Rate: {hourlyRewardRate} LIB</h2>

      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pair</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. APR</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reward Weight</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TVL</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">My Pool Share</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">My Earnings</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pairs.map((pair) => (
              <tr key={pair.lpToken}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => handlePairClick(pair.lpToken.toString())} className="text-blue-600 hover:text-blue-800">
                    {truncateAddress(pair.lpToken[0])}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{pair.platform}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pair.apr.toFixed(1)}%</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {ethers.formatEther(pair.weight)} ({(Number(pair.weight) * 100) / Number(pairs.reduce((acc, p) => acc + p.weight, BigInt(0)))}%)
                </td>
                <td className="px-6 py-4 whitespace-nowrap">${(pair.tvl / 1000).toFixed(1)}K</td>
                <td className="px-6 py-4 whitespace-nowrap">{pair.myShare.toFixed(4)}%</td>
                <td className="px-6 py-4 whitespace-nowrap">{pair.myEarnings.toFixed(2)} LIB</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleShareClick(pair)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    disabled={!signer}
                  >
                    Stake
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" onClick={() => setIsModalOpen(false)}>
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="mt-3 text-center">
              <div className="flex justify-center mb-4">
                <button
                  className={`mx-1 py-2 px-4 ${tabValue === 0 ? "bg-blue-500 text-white" : "bg-gray-200"} rounded`}
                  onClick={() => setTabValue(0)}
                >
                  Stake
                </button>
                <button
                  className={`mx-1 py-2 px-4 ${tabValue === 1 ? "bg-blue-500 text-white" : "bg-gray-200"} rounded`}
                  onClick={() => setTabValue(1)}
                >
                  Unstake
                </button>
                <button
                  className={`mx-1 py-2 px-4 ${tabValue === 2 ? "bg-blue-500 text-white" : "bg-gray-200"} rounded`}
                  onClick={() => setTabValue(2)}
                >
                  Withdraw
                </button>
              </div>

              {tabValue === 0 && (
                <div className="mt-2 px-7 py-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={stakePercent}
                    onChange={(e) => setStakePercent(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">Stake {stakePercent}%</p>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 mt-4"
                    onClick={handleStake}
                    disabled={selectedPair?.weight === BigInt(0)}
                  >
                    Stake
                  </button>
                </div>
              )}

              {tabValue === 1 && (
                <div className="mt-2 px-7 py-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={unstakePercent}
                    onChange={(e) => setUnstakePercent(Number(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">Unstake {unstakePercent}%</p>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 mt-4"
                    onClick={handleUnstake}
                  >
                    Unstake
                  </button>
                </div>
              )}

              {tabValue === 2 && (
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">Available to withdraw: {selectedPair?.myEarnings.toFixed(2)} LIB</p>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 mt-4"
                    onClick={handleWithdraw}
                    disabled={!selectedPair?.myEarnings}
                  >
                    Withdraw All
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
