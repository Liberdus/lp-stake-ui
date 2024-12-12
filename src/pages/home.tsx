import { SetStateAction, useEffect, useState } from 'react';
import { userInfoAtom } from '@/store/userInfo';
import { useAtom } from 'jotai';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { useContract } from '@/providers/ContractProvider';
import { ethers } from 'ethers';
import { 
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogContent,
  Tabs,
  Tab,
  Box,
  Slider,
  Stack
} from '@mui/material';

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
  const [hourlyRewardRate, setHourlyRewardRate] = useState<string>('0');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPair, setSelectedPair] = useState<PairInfo | null>(null);
  const [stakePercent, setStakePercent] = useState<number>(100);
  const [unstakePercent, setUnstakePercent] = useState<number>(100);
  const [tabValue, setTabValue] = useState(0);
  
  const { 
    contract, 
    stake, 
    unstake, 
    claimRewards, 
    getPairs,
    getDailyRewardRate,
    getUserStakeInfo,
    getTotalWeight
  } = useContract();

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
            pairsData.map(async (pair: string) => {
              const info = await contract.pairs(pair);
              let myShare = 0;
              let myEarnings = 0;
              
              if (signer) {
                const userStake = await getUserStakeInfo(await signer.getAddress(), pair);
                myShare = Number(userStake.amount) / 1e18;
                myEarnings = Number(userStake.pendingRewards) / 1e18;
              }
              
              // Mock TVL and APR calculations - replace with actual calculations
              const tvl = Math.random() * 1000000;
              const apr = info.weight > 0 ? (15 + Math.random() * 5) : 0;
              
              return {
                lpToken: pair,
                platform: info.platform,
                weight: info.weight,
                isActive: info.isActive,
                apr,
                tvl,
                myShare,
                myEarnings
              };
            })
          );

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
          console.error('Error fetching data:', error);
        }
      }
    }
    fetchData();
  }, [contract, provider, signer]);

  const handlePairClick = (pair: string) => {
    window.open(`https://app.uniswap.org/#/add/v2/${pair}`, '_blank');
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
      console.error('Error staking:', error);
    }
  };

  const handleUnstake = async () => {
    if (!selectedPair || unstakePercent === 0) return;
    try {
      await unstake(selectedPair.lpToken, (unstakePercent / 100).toString());
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error unstaking:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedPair) return;
    try {
      await claimRewards(selectedPair.lpToken);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error withdrawing:', error);
    }
  };

  return (
    <Container>
      <Typography variant="h3" align="center" gutterBottom sx={{ my: 4 }}>
        LP Staking
      </Typography>
      
      <Typography variant="h6" gutterBottom>
        Hourly Reward Rate: {hourlyRewardRate} LIB
      </Typography>

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
                  <Button 
                    onClick={() => handlePairClick(pair.lpToken)}
                    color="primary"
                  >
                    {pair.lpToken}
                  </Button>
                </TableCell>
                <TableCell>{pair.platform}</TableCell>
                <TableCell>{pair.apr.toFixed(1)}%</TableCell>
                <TableCell>
                  {ethers.formatEther(pair.weight)} ({Number(pair.weight) * 100 / Number(pairs.reduce((acc, p) => acc + p.weight, BigInt(0)))}%)
                </TableCell>
                <TableCell>${(pair.tvl / 1000).toFixed(1)}K</TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleShareClick(pair)}
                    color="primary"
                    disabled={!signer}
                  >
                    {pair.myShare.toFixed(4)}%
                  </Button>
                </TableCell>
                <TableCell>
                  <Button 
                    onClick={() => handleShareClick(pair)}
                    color="primary"
                    disabled={!signer}
                  >
                    {pair.myEarnings.toFixed(2)} LIB
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          <Box sx={{ width: '100%' }}>
            <Tabs 
              value={tabValue} 
              onChange={(_: any, newValue: SetStateAction<number>) => setTabValue(newValue)}
              centered
              sx={{ mb: 3 }}
            >
              <Tab label="Stake" />
              <Tab label="Unstake" />
              <Tab label="Withdraw" />
            </Tabs>

            {tabValue === 0 && (
              <Stack spacing={3}>
                <Slider
                  value={stakePercent}
                  onChange={(_: any, value: number) => setStakePercent(value as number)}
                  valueLabelDisplay="auto"
                />
                <Typography>Stake {stakePercent}%</Typography>
                <Button
                  variant="contained"
                  onClick={handleStake}
                  disabled={selectedPair?.weight === BigInt(0)}
                  fullWidth
                >
                  Stake
                </Button>
              </Stack>
            )}

            {tabValue === 1 && (
              <Stack spacing={3}>
                <Slider
                  value={unstakePercent}
                  onChange={(_: any, value: number) => setUnstakePercent(value as number)}
                  valueLabelDisplay="auto"
                />
                <Typography>Unstake {unstakePercent}%</Typography>
                <Button
                  variant="contained"
                  onClick={handleUnstake}
                  fullWidth
                >
                  Unstake
                </Button>
              </Stack>
            )}

            {tabValue === 2 && (
              <Stack spacing={3}>
                <Typography>
                  Available to withdraw: {selectedPair?.myEarnings.toFixed(2)} LIB
                </Typography>
                <Button
                  variant="contained"
                  onClick={handleWithdraw}
                  disabled={!selectedPair?.myEarnings}
                  fullWidth
                >
                  Withdraw All
                </Button>
              </Stack>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Home;
