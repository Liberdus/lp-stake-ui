import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { useContract } from '@/providers/ContractProvider';
import { ethers } from 'ethers';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Skeleton, Box, Card, CardContent, Grid, Chip } from '@mui/material';
import { PairInfo, SCPairData } from '@/types';
import StakingModal from '@/components/StakingModal';
import SimpleAlert from '@/components/SimpleAlert';
import { calcAPR, fetchTokenPrice } from '@/utils';
import { rewardTokenAtom } from '@/store/rewardToken';
import { refetchAtom } from '@/store/refetch';
import RefreshButton from '@/components/RefreshButton';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PercentIcon from '@mui/icons-material/Percent';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ShareIcon from '@mui/icons-material/Share';
import RedeemIcon from '@mui/icons-material/Redeem';

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
            let allowance = BigInt(0);

            const lpTokenPrice = await fetchTokenPrice(pair.lpToken);
            const rewardTokenPrice = await fetchTokenPrice(rewardToken.address);

            const apr = calcAPR(Number(ethers.formatEther(hourlyRate)), Number(ethers.formatEther(await getTVL(pair.lpToken))), lpTokenPrice, rewardTokenPrice);
            const tvl = Number(ethers.formatEther(await getTVL(pair.lpToken)));

            if (signer) {
              const userAddress = await signer.getAddress();
              const userStake = await getUserStakeInfo(userAddress, pair.lpToken);
              myShare = (Number(ethers.formatEther(userStake.amount)) * 100) / tvl || 0;
              myEarnings = Number(ethers.formatEther(await getPendingRewards(userAddress, pair.lpToken)));
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
              allowance,
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
      } catch (error) {}
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
    <Container maxWidth="xl">
      <Grid sx={{ mb: 4, mt: 4 }}>
        <Typography variant="h3" align="center" gutterBottom>
          LP Staking
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
          <AccessTimeIcon />
          <Typography variant="h6">Hourly Reward Rate: {Number(hourlyRewardRate).toFixed(2)} LIB</Typography>
          <RefreshButton onClick={() => setRefetch(true)} loading={isLoading} />
        </Box>
      </Grid>

      <SimpleAlert />

      {isLoading ? (
        <Card>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} md={4} key={i}>
              <CardContent>
                <Skeleton variant="rectangular" height={40} />
              </CardContent>
            </Grid>
          ))}
        </Card>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <SwapHorizIcon sx={{ mr: 1 }} />
                    Pair
                  </TableCell>
                  <TableCell>
                    <AccountBalanceIcon sx={{ mr: 1 }} />
                    Platform
                  </TableCell>
                  <TableCell>
                    <PercentIcon sx={{ mr: 1 }} />
                    Est. APR
                  </TableCell>
                  <TableCell>
                    <MonetizationOnIcon sx={{ mr: 1 }} />
                    Reward Weight
                  </TableCell>
                  <TableCell>
                    <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                    TVL
                  </TableCell>
                  <TableCell>
                    <ShareIcon sx={{ mr: 1 }} />
                    My Pool Share
                  </TableCell>
                  <TableCell>
                    <RedeemIcon sx={{ mr: 1 }} />
                    My Earnings
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pairs.map((pair) => (
                  <TableRow key={pair.lpToken} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell>
                      <Button onClick={() => handlePairClick(pair.lpToken.toString())} variant="text" color="primary" endIcon={<OpenInNewIcon />} sx={{ fontWeight: 'bold' }}>
                        {pair.pairName}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Chip label={pair.platform} color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ color: 'success.main', fontWeight: 'bold' }}>{pair.apr.toFixed(1)}%</TableCell>
                    <TableCell>
                      <Chip
                        label={`${ethers.formatEther(pair.weight)} (${((Number(pair.weight) * 100) / Number(pairs.reduce((acc, p) => acc + p.weight, BigInt(0)))).toFixed(2)}%)`}
                        color="secondary"
                      />
                    </TableCell>
                    <TableCell>{pair.tvl.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button onClick={() => handleShareClick(pair)} variant="contained" color="primary" disabled={!signer} size="small" startIcon={<ShareIcon />}>
                        {pair.myShare.toFixed(2)}%
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button onClick={() => handleShareClick(pair)} variant="contained" color="secondary" disabled={!signer} size="small" startIcon={<RedeemIcon />}>
                        {pair.myEarnings.toFixed(4)} LIB
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <StakingModal selectedPair={selectedPair} isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
    </Container>
  );
};

export default Home;
