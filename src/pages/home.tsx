import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { useContract } from '@/providers/ContractProvider';
import { ethers } from 'ethers';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Skeleton } from '@mui/material';
import { PairInfo, SCPairData } from '@/types';
import StakingModal from '@/components/StakingModal';
import SimpleAlert from '@/components/SimpleAlert';
import { calcAPR, fetchTokenPrice } from '@/utils';
import { rewardTokenAtom } from '@/store/rewardToken';
import { refetchAtom } from '@/store/refetch';

const Home: React.FC = () => {
  const [pairs, setPairs] = useState<PairInfo[]>([]);
  const [hourlyRewardRate, setHourlyRewardRate] = useState<string>('0');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<PairInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const rewardToken = useAtomValue(rewardTokenAtom);
  const { contract, getPairs, getHourlyRewardRate, getUserStakeInfo, getTVL, getPendingRewards } = useContract();
  const [refetch, setRefetch] = useAtom(refetchAtom);
  const provider = useEthersProvider();
  const signer = useEthersSigner();

  async function fetchData() {
    setIsLoading(true);
    if (contract && provider) {
      try {
        const pairsData = await getPairs();
        const hourlyRate = await getHourlyRewardRate();
        const pairsInfo: PairInfo[] = await Promise.all(
          pairsData.map(async (pair: SCPairData) => {
            let myShare = 0;
            let myEarnings = 0;

            const lpTokenPrice = await fetchTokenPrice(pair.lpToken);
            const rewardTokenPrice = await fetchTokenPrice(rewardToken.address);

            const apr = calcAPR(Number(ethers.formatEther(hourlyRate)), Number(ethers.formatEther(await getTVL(pair.lpToken))), lpTokenPrice, rewardTokenPrice);
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
        setHourlyRewardRate(ethers.formatEther(hourlyRate));
      } catch (error) {
      }
    }
    setIsLoading(false);
  }

  useEffect(() => {
    fetchData();
  }, [contract, provider, signer, rewardToken]);

  useEffect(() => {
    if (refetch) {
      fetchData();
      setRefetch(false);
    }
  }, [refetch]);

  const handlePairClick = (pairAddress: string) => {
    window.open(`https://app.uniswap.org/explore/pools/polygon/${pairAddress}`, '_blank');
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
        Hourly Reward Rate: {Number(hourlyRewardRate).toFixed(2)} LIB
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
            {isLoading ? (
              <>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Skeleton variant="rectangular" height={40} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Skeleton variant="rectangular" height={40} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Skeleton variant="rectangular" height={40} />
                  </TableCell>
                </TableRow>
              </>
            ) : (
              pairs.map((pair) => (
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
                  <TableCell>{pair.tvl.toFixed(2)}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <StakingModal selectedPair={selectedPair} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </Container>
  );
};

export default Home;
