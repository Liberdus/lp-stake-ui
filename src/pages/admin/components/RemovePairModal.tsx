import ModalBox from '@/components/ModalBox';
import { useContract } from '@/providers/ContractProvider';
import { Alert, Button, Card, CardActions, CardContent, Modal, Stack, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';

interface RemovePairModalProps {
  open: boolean;
  onClose: () => void;
}

const RemovePairModal: React.FC<RemovePairModalProps> = ({ open, onClose }) => {
  const [removePairAddress, setRemovePairAddress] = useState<string>('');
  const [error, setError] = useState<string>('');
  const { proposeRemovePair } = useContract();

  const validateInput = (): boolean => {
    if (!removePairAddress) {
      setError('Please enter an LP token address');
      return false;
    }
    if (!ethers.isAddress(removePairAddress)) {
      setError('Invalid LP token address format');
      return false;
    }
    setError('');
    return true;
  };

  const handleProposeRemovePair = async () => {
    if (!validateInput()) return;

    try {
      await proposeRemovePair(removePairAddress);
      onClose();
    } catch (err) {
      setError('Failed to propose pair removal. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card sx={{ minWidth: 400 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Remove Pair
            </Typography>

            <Stack spacing={2}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                label="LP Token Address"
                value={removePairAddress}
                onChange={(e) => setRemovePairAddress(e.target.value)}
                variant="outlined"
                fullWidth
                helperText="Enter the LP token address to remove"
              />
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 2 }}>
            <Button fullWidth variant="contained" color="error" onClick={handleProposeRemovePair} size="large" disabled={!removePairAddress}>
              Propose Remove Pair
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default RemovePairModal;
