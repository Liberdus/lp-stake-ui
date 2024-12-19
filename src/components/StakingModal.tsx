import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useContract } from '@/providers/ContractProvider';
import { refetchAtom } from '@/store/refetch';
import { PairInfo, TokenInfo } from '@/types';
import { Button, Paper } from '@mui/material';
import { Box, Typography, Slider, Stack, DialogContent, Tab, Divider } from '@mui/material';
import { Dialog, Tabs } from '@mui/material';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { SetStateAction, useEffect, useState } from 'react';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloseIcon from '@mui/icons-material/Close';
import StakeIcon from '@mui/icons-material/AddCircleOutline';
import UnstakeIcon from '@mui/icons-material/RemoveCircleOutline';
import RewardsIcon from '@mui/icons-material/LocalAtm';
import PercentIcon from '@mui/icons-material/Percent';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import IconButton from '@mui/material/IconButton';

interface StakingModalProps {
  selectedPair: PairInfo | null;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

const StakingModal: React.FC<StakingModalProps> = ({ selectedPair, isModalOpen, setIsModalOpen }) => {
  const [tabValue, setTabValue] = useState(0);
  const [stakePercent, setStakePercent] = useState<number>(100);
  const [unstakePercent, setUnstakePercent] = useState<number>(100);
  const [balance, setBalance] = useState<number>(0);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [pendingRewards, setPendingRewards] = useState<number>(0);
  const [, setRefetch] = useAtom(refetchAtom);
  const { stake, unstake, claimRewards, getTokenInfo, getERC20Balance, getPendingRewards } = useContract();
  const signer = useEthersSigner();

  const handleStake = async () => {
    if (!selectedPair || stakePercent === 0) return;
    await stake(selectedPair.lpToken, ((stakePercent * balance) / 100).toString());
    setIsModalOpen(false);
    setRefetch(true);
  };

  const handleUnstake = async () => {
    if (!selectedPair || unstakePercent === 0) return;
    // Calculate staked amount
    const stakedAmount = (selectedPair.myShare * selectedPair.tvl) / 100;
    // Calculate unstake amount and floor it to avoid rounding errors
    const unstakeAmount = Math.floor((unstakePercent * stakedAmount) / 100 * 1e18) / 1e18;
    // console.log(unstakeAmount);
    await unstake(selectedPair.lpToken, unstakeAmount.toString());
    setIsModalOpen(false);
    setRefetch(true);
  };

  const handleWithdraw = async () => {
    if (!selectedPair) return;
    await claimRewards(selectedPair.lpToken);
    setIsModalOpen(false);
    setRefetch(true);
  };

  useEffect(() => {
    async function fetchData() {
      if (!signer || !selectedPair) return;
      const tokenInfo = await getTokenInfo(selectedPair.lpToken);
      const tokenBalanceOfSigner = await getERC20Balance(signer.address, selectedPair.lpToken);
      const pendingRewards = await getPendingRewards(signer.address, selectedPair.lpToken);
      setTokenInfo(tokenInfo);
      setBalance(Number(ethers.formatUnits(tokenBalanceOfSigner, tokenInfo.decimals)));
      setPendingRewards(pendingRewards);
    }
    fetchData();
  }, [selectedPair, signer]);

  if (!selectedPair || !tokenInfo) return null;

  // Calculate staked amount for display
  const stakedAmount = (selectedPair.myShare * selectedPair.tvl) / 100;
  // Calculate unstake amount and floor it to avoid rounding errors
  const unstakeAmount = Math.floor((unstakePercent * stakedAmount) / 100 * 1e18) / 1e18;

  return (
    <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth PaperProps={{ elevation: 0 }}>
      <DialogContent sx={{ p: 0 }}>
        <Paper sx={{ p: 4, borderRadius: 2, position: 'relative' }}>
          <IconButton 
            onClick={() => setIsModalOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <SwapHorizIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {selectedPair.pairName}
            </Typography>
          </Box>
          
          <Tabs 
            value={tabValue} 
            onChange={(_: any, newValue: SetStateAction<number>) => setTabValue(newValue)} 
            centered 
            sx={{ 
              mb: 4,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px'
              }
            }}
          >
            <Tab icon={<StakeIcon />} label="Stake" sx={{ fontWeight: 500 }} />
            <Tab icon={<UnstakeIcon />} label="Unstake" sx={{ fontWeight: 500 }} />
            <Tab icon={<RewardsIcon />} label="Withdraw" sx={{ fontWeight: 500 }} />
          </Tabs>

          <Divider sx={{ mb: 4 }} />

          {tabValue === 0 && (
            <Stack spacing={4}>
              <Box sx={{ px: 2 }}>
                <Slider 
                  value={stakePercent} 
                  onChange={(_: any, value: number | number[]) => setStakePercent(value as number)} 
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => <div>{value}%</div>}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 24,
                      height: 24
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PercentIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Stake {stakePercent}% ({(stakePercent * balance) / 100} {tokenInfo?.symbol})
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WalletIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Balance: {balance.toFixed(4)} {tokenInfo?.symbol}
                  </Typography>
                </Box>
              </Box>
              <Button 
                variant="contained" 
                onClick={handleStake} 
                disabled={selectedPair?.weight === BigInt(0)} 
                fullWidth
                size="large"
                startIcon={<StakeIcon />}
                sx={{ 
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2
                }}
              >
                Stake Tokens
              </Button>
            </Stack>
          )}

          {tabValue === 1 && (
            <Stack spacing={4}>
              <Box sx={{ px: 2 }}>
                <Slider 
                  value={unstakePercent} 
                  onChange={(_: any, value: number | number[]) => setUnstakePercent(value as number)} 
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => <div>{value}%</div>}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 24,
                      height: 24
                    }
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <UnstakeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  Unstake {unstakePercent}% ({unstakeAmount.toFixed(4)} {tokenInfo?.symbol})
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                onClick={handleUnstake} 
                fullWidth
                size="large"
                startIcon={<UnstakeIcon />}
                sx={{ 
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2
                }}
              >
                Unstake Tokens
              </Button>
            </Stack>
          )}

          {tabValue === 2 && (
            <Stack spacing={4}>
              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  borderRadius: 2, 
                  textAlign: 'center',
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
                  <Typography variant="h6">Available Rewards</Typography>
                </Box>
                <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                  {pendingRewards.toFixed(4)} LIB
                </Typography>
              </Paper>
              <Button 
                variant="contained" 
                onClick={handleWithdraw} 
                disabled={pendingRewards === 0} 
                fullWidth
                size="large"
                startIcon={<RewardsIcon />}
                sx={{ 
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderRadius: 2
                }}
              >
                Claim Rewards
              </Button>
            </Stack>
          )}
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default StakingModal;
