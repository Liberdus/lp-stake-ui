import { Button, CardActions, Card, TextField, CardContent, Modal, Typography } from '@mui/material';
import { useState } from 'react';
import { useContract } from '@/providers/ContractProvider';

interface WithdrawalModalProps {
  open: boolean;
  onClose: () => void;
}
const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ open, onClose }) => {
  const [recipient, setRecipient] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');

  const { contract, proposeWithdrawRewards } = useContract();

  const handleProposeWithdrawal = async () => {
    if (!contract) return;
    await proposeWithdrawRewards(recipient, withdrawAmount);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Withdrawal
          </Typography>
          <TextField fullWidth value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient Address" margin="normal" />
          <TextField fullWidth value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="Withdrawal Amount" margin="normal" />
        </CardContent>
        <CardActions>
          <Button fullWidth variant="contained" color="warning" onClick={handleProposeWithdrawal} disabled={!recipient || !withdrawAmount}>
            Propose Withdrawal
          </Button>
        </CardActions>
      </Card>
    </Modal>
  );
};

export default WithdrawalModal;
