import ModalBox from '@/components/ModalBox';
import { useContract } from '@/providers/ContractProvider';
import { Modal, Box, Typography, TextField, Button, CardContent, CardActions, Card } from '@mui/material';
import { useState } from 'react';

interface HourlyRateModalProps {
  open: boolean;
  onClose: () => void;
}

const HourlyRateModal: React.FC<HourlyRateModalProps> = ({ open, onClose }) => {
  const [newHourlyRate, setNewHourlyRate] = useState<string>('0');

  const { proposeSetHourlyRewardRate } = useContract();

  const handleProposeHourlyRate = async () => {
    if (newHourlyRate !== '0') {
      try {
        await proposeSetHourlyRewardRate(newHourlyRate);
      } catch (error) {
        console.error('Error proposing hourly rate:', error);
      }
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Set Hourly Reward Rate
            </Typography>
            <TextField type="number" fullWidth value={newHourlyRate} onChange={(e) => setNewHourlyRate(e.target.value)} placeholder="New hourly rate" margin="normal" />
          </CardContent>
          <CardActions>
            <Button fullWidth variant="contained" onClick={handleProposeHourlyRate} disabled={newHourlyRate === '0'}>
              Propose New Rate
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default HourlyRateModal;
