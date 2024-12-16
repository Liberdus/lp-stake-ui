import { useEffect, useState } from 'react';
import { userInfoAtom } from '@/store/userInfo';
import { useAtom } from 'jotai';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { useContract } from '@/providers/ContractProvider';
import { ethers } from 'ethers';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { PairInfo, SCPairData } from '@/types';
import StakingModal from '@/components/StakingModal';
import SimpleAlert from '@/components/SimpleAlert';

const REWARD_TOKEN_ADDRESS = import.meta.env.VITE_REWARD_TOKEN_ADDRESS;

const Home: React.FC = () => {
  const [userInfo, setUserInfo] = useAtom(userInfoAtom);
  const [pairs, setPairs] = useState<PairInfo[]>([]);
  const [dailyRewardRate, setDailyRewardRate] = useState<string>('0');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<PairInfo | null>(null);

  const { contract, getPairs, getDailyRewardRate, getUserStakeInfo, getTotalWeight, getTVL, getPendingRewards } = useContract();

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
            pairsData.map(async (pair: SCPairData) => {
              let myShare = 0;
              let myEarnings = 0;

              const apr = pair.weight > 0 ? 15 + Math.random() * 5 : 0;
              const tvl = Number(ethers.formatEther(await getTVL(pair.lpToken)));

              if (signer) {
                const userStake = await getUserStakeInfo(await signer.getAddress(), pair.lpToken);
                myShare = (Number(ethers.formatEther(userStake.amount)) * 100) / tvl || 0;
                myEarnings = await getPendingRewards(await signer.getAddress(), pair.lpToken);
              }

              return {
                lpToken: pair.lpToken,
                pairName: pair.pairName,
                platform: pair.platform,
                weight: pair.weight,
                isActive: pair.isActive,
                apr,
                tvl,
                myShare,
                myEarnings,
              };
            })
          );

          const sortedPairs = pairsInfo.sort((a, b) => {
            if (a.weight !== b.weight) {
              return a.weight > b.weight ? -1 : 1;
            }
            if (a.tvl !== b.tvl) {
              return b.tvl - a.tvl;
            }
            return b.apr - a.apr;
          });
          setPairs(sortedPairs);
          setDailyRewardRate(ethers.formatEther(dailyRate));
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    }
    fetchData();
  }, [contract, provider, signer]);

  const handlePairClick = (pairAddress: string) => {
    window.open(`https://app.uniswap.org/#/add/v2/${pairAddress}`, '_blank');
  };

  const handleShareClick = (pair: PairInfo) => {
    setSelectedPair(pair);
    setIsModalOpen(true);
  };

  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
        LP Staking
      </Typography>

      <Typography variant="h6" gutterBottom>
        Daily Reward Rate: {Number(dailyRewardRate).toFixed(2)} LIB
      </Typography>

      <SimpleAlert />

      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pair</TableCell>
              <TableCell>Platform</TableCell>
              <TableCell>Est. APR</TableCell>
              <TableCell>Reward Weight</TableCell>
              <TableCell>TVL</TableCell>
              <TableCell>My Pool Share</TableCell>
              <TableCell>My Earnings</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pairs.map((pair) => (
              <TableRow key={pair.lpToken}>
                <TableCell>
                  <Button onClick={() => handlePairClick(pair.lpToken.toString())} color="primary">
                    {pair.pairName}
                  </Button>
                </TableCell>
                <TableCell>{pair.platform}</TableCell>
                <TableCell>{pair.apr.toFixed(1)}%</TableCell>
                <TableCell>
                  {ethers.formatEther(pair.weight)} ({((Number(pair.weight) * 100) / Number(pairs.reduce((acc, p) => acc + p.weight, BigInt(0)))).toFixed(2)}%)
                </TableCell>
                <TableCell>{(pair.tvl).toFixed(2)}</TableCell>
                <TableCell>
                  <Button onClick={() => handleShareClick(pair)} color="primary" disabled={!signer}>
                    {pair.myShare.toFixed(2)}%
                  </Button>
                </TableCell>
                <TableCell>
                  <Button onClick={() => handleShareClick(pair)} color="primary" disabled={!signer}>
                    {pair.myEarnings.toFixed(4)} LIB
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <StakingModal selectedPair={selectedPair} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </Container>
  );
};

export default Home;
