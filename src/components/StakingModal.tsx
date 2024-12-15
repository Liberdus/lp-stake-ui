import { useContract } from '@/providers/ContractProvider';
import { PairInfo } from '@/types';
import { Button } from '@mui/material';
import { Box, Typography, Slider, Stack, DialogContent, Tab } from '@mui/material';
import { Dialog, Tabs } from '@mui/material';
import { SetStateAction, useState } from 'react';

interface StakingModalProps {
  selectedPair: PairInfo | null;
  isModalOpen: boolean;
  setIsModalOpen: (value: boolean) => void;
}

const StakingModal: React.FC<StakingModalProps> = ({ selectedPair, isModalOpen, setIsModalOpen }) => {
  const [tabValue, setTabValue] = useState(0);
  const [stakePercent, setStakePercent] = useState<number>(100);
  const [unstakePercent, setUnstakePercent] = useState<number>(100);

  const { stake, unstake, claimRewards } = useContract();

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
                <Typography>Stake {stakePercent}%</Typography>
                <Typography>
                  Balance: {selectedPair?.myShare.toFixed(4)}/{selectedPair?.myEarnings.toFixed(2)} {selectedPair?.symbol}
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
              <Typography>Unstake {unstakePercent}%</Typography>
              <Button variant="contained" onClick={handleUnstake} fullWidth>
                Unstake
              </Button>
            </Stack>
          )}

          {tabValue === 2 && (
            <Stack spacing={3}>
              <Typography>Available to withdraw: {selectedPair?.myEarnings.toFixed(2)} LIB</Typography>
              <Button variant="contained" onClick={handleWithdraw} disabled={!selectedPair?.myEarnings} fullWidth>
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
