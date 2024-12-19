import ModalBox from '@/components/ModalBox';
import { useContract } from '@/providers/ContractProvider';
import { Modal, Typography, TextField, Button, CardContent, CardActions, Card, Stack, Alert } from '@mui/material';
import { useState } from 'react';

interface HourlyRateModalProps {
  open: boolean;
  onClose: () => void;
}

const HourlyRateModal: React.FC<HourlyRateModalProps> = ({ open, onClose }) => {
  const [newHourlyRate, setNewHourlyRate] = useState<string>('0');
  const [error, setError] = useState<string>('');

  const { proposeSetHourlyRewardRate } = useContract();

  const validateInput = (): boolean => {
    if (newHourlyRate === '0') {
      setError('Hourly rate cannot be zero');
      return false;
    }
    if (Number(newHourlyRate) < 0) {
      setError('Hourly rate cannot be negative');
      return false;
    }
    setError('');
    return true;
  };

  const handleProposeHourlyRate = async () => {
    if (!validateInput()) return;

    try {
      await proposeSetHourlyRewardRate(newHourlyRate);
      onClose();
    } catch (err) {
      setError('Failed to propose new hourly rate. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card sx={{ minWidth: 400 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Set Hourly Reward Rate
            </Typography>

            <Stack spacing={2}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="New Hourly Rate"
                type="number"
                value={newHourlyRate}
                onChange={(e) => setNewHourlyRate(e.target.value)}
                variant="outlined"
                fullWidth
                helperText="Enter the new hourly reward rate in LIB tokens"
                InputProps={{
                  inputProps: { min: 0, step: '0.000001' },
                }}
              />
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 2 }}>
            <Button fullWidth variant="contained" color="warning" onClick={handleProposeHourlyRate} size="large" disabled={newHourlyRate === '0'}>
              Propose New Rate
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default HourlyRateModal;
