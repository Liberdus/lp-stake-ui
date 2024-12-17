import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useContract } from '@/providers/ContractProvider';
import { refetchAtom } from '@/store/refetch';
import { PairInfo, TokenInfo } from '@/types';
import { Button } from '@mui/material';
import { Box, Typography, Slider, Stack, DialogContent, Tab } from '@mui/material';
import { Dialog, Tabs } from '@mui/material';
import { ethers } from 'ethers';
import { useAtom } from 'jotai';
import { SetStateAction, useEffect, useState } from 'react';

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
    await unstake(selectedPair.lpToken, ((unstakePercent * selectedPair.myShare * selectedPair.tvl) / 10000).toString());
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

  return (
    <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="sm" fullWidth>
      <DialogContent>
        <Box sx={{ width: '100%' }}>
          <Tabs value={tabValue} onChange={(_: any, newValue: SetStateAction<number>) => setTabValue(newValue)} centered sx={{ mb: 3 }}>
            <Tab label="Stake" />
            <Tab label="Unstake" />
            <Tab label="Withdraw" />
          </Tabs>

          {tabValue === 0 && (
            <Stack spacing={3}>
              <Slider value={stakePercent} onChange={(_: any, value: number | number[]) => setStakePercent(value as number)} valueLabelDisplay="auto" />
              <Box className="flex justify-between">
                <Typography>
                  Stake {stakePercent}% ({(stakePercent * balance) / 100} {tokenInfo?.symbol})
                </Typography>
                <Typography>
                  Balance: {balance.toFixed(4)} {tokenInfo?.symbol}
                </Typography>
              </Box>
              <Button variant="contained" onClick={handleStake} disabled={selectedPair?.weight === BigInt(0)} fullWidth>
                Stake
              </Button>
            </Stack>
          )}

          {tabValue === 1 && (
            <Stack spacing={3}>
              <Slider value={unstakePercent} onChange={(_: any, value: number | number[]) => setUnstakePercent(value as number)} valueLabelDisplay="auto" />
              <Typography>
                Unstake {unstakePercent}% ({((unstakePercent * selectedPair?.myShare * selectedPair?.tvl) / 10000).toFixed(2)} {tokenInfo?.symbol})
              </Typography>
              <Button variant="contained" onClick={handleUnstake} fullWidth>
                Unstake
              </Button>
            </Stack>
          )}

          {tabValue === 2 && (
            <Stack spacing={3}>
              <Typography>Available to withdraw: {pendingRewards.toFixed(4)} LIB</Typography>
              <Button variant="contained" onClick={handleWithdraw} disabled={pendingRewards === 0} fullWidth>
                Withdraw All
              </Button>
            </Stack>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default StakingModal;
