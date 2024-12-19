import { Button, CardActions, Card, TextField, CardContent, Modal, Typography, Stack, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import { useContract } from '@/providers/ContractProvider';
import ModalBox from '@/components/ModalBox';
import { ethers } from 'ethers';
import { rewardTokenAtom } from '@/store/rewardToken';
import { useAtomValue } from 'jotai';

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ open, onClose }) => {
  const [recipient, setRecipient] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const rewardToken = useAtomValue(rewardTokenAtom);
  const { proposeWithdrawRewards, getERC20Balance, getContractAddress } = useContract();

  useEffect(() => {
    const fetchBalance = async () => {
      const balance = await getERC20Balance(await getContractAddress(), rewardToken.address);
      setBalance(Number(ethers.formatUnits(balance, rewardToken.decimals)));
    };
    fetchBalance();
  }, []);

  const validateInputs = (): boolean => {
    if (!recipient || !withdrawAmount) {
      setError('Please fill in all fields');
      return false;
    }
    if (!ethers.isAddress(recipient)) {
      setError('Invalid recipient address format');
      return false;
    }
    if (Number(withdrawAmount) <= 0) {
      setError('Withdrawal amount must be greater than 0');
      return false;
    }
    if (Number(withdrawAmount) > balance) {
      setError('Insufficient balance');
      return false;
    }
    setError('');
    return true;
  };

  const handleProposeWithdrawal = async () => {
    if (!validateInputs()) return;

    try {
      await proposeWithdrawRewards(recipient, withdrawAmount);
      onClose();
    } catch (err) {
      setError('Failed to propose withdrawal. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card sx={{ minWidth: 400 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Propose Withdrawal
            </Typography>

            <Stack spacing={2}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField label="Recipient Address" value={recipient} onChange={(e) => setRecipient(e.target.value)} variant="outlined" fullWidth helperText="Enter the recipient's wallet address" />

              <TextField
                label="Withdrawal Amount"
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                variant="outlined"
                fullWidth
                helperText={`Available balance: ${balance.toLocaleString()} ${rewardToken.symbol}`}
                InputProps={{
                  inputProps: { min: 0, step: '0.000001' },
                }}
              />
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 2 }}>
            <Button fullWidth variant="contained" color="warning" onClick={handleProposeWithdrawal} size="large" disabled={!recipient || !withdrawAmount}>
              Propose Withdrawal
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default WithdrawalModal;
