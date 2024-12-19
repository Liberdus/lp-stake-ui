import ModalBox from '@/components/ModalBox';
import { useContract } from '@/providers/ContractProvider';
import { Alert, Button, Card, CardActions, CardContent, Modal, Stack, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useState } from 'react';

interface ChangeSignerModalProps {
  open: boolean;
  onClose: () => void;
}

const ChangeSignerModal: React.FC<ChangeSignerModalProps> = ({ open, onClose }) => {
  const [newSignerAddress, setNewSignerAddress] = useState<string>('');
  const [oldSignerAddress, setOldSignerAddress] = useState<string>('');
  const [error, setError] = useState<string>('');

  const { proposeChangeSigner } = useContract();

  const validateInputs = (): boolean => {
    if (!oldSignerAddress || !newSignerAddress) {
      setError('Please fill in both addresses');
      return false;
    }
    if (!ethers.isAddress(newSignerAddress)) {
      setError('Invalid new signer address format');
      return false;
    }
    if (!ethers.isAddress(oldSignerAddress)) {
      setError('Invalid old signer address format');
      return false;
    }
    setError('');
    return true;
  };

  const handleProposeChangeSigner = async () => {
    if (!validateInputs()) return;
    
    try {
      await proposeChangeSigner(oldSignerAddress, newSignerAddress);
      onClose();
    } catch (err) {
      setError('Failed to propose signer change. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card sx={{ minWidth: 400 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Change Signer
            </Typography>

            <Stack spacing={2}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

              <TextField
                label="Old Signer Address"
                value={oldSignerAddress}
                onChange={(e) => setOldSignerAddress(e.target.value)}
                variant="outlined"
                fullWidth
                helperText="Enter the address of the current signer"
              />

              <TextField
                label="New Signer Address" 
                value={newSignerAddress}
                onChange={(e) => setNewSignerAddress(e.target.value)}
                variant="outlined"
                fullWidth
                helperText="Enter the address of the new signer"
              />
            </Stack>
          </CardContent>

          <CardActions sx={{ p: 2 }}>
            <Button
              fullWidth
              variant="contained"
              color="warning"
              onClick={handleProposeChangeSigner}
              size="large"
              disabled={!oldSignerAddress || !newSignerAddress}
            >
              Propose Signer Change
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default ChangeSignerModal;
