import ModalBox from '@/components/ModalBox';
import { useContract } from '@/providers/ContractProvider';
import { Alert, Button, Card, CardActions, CardContent, Modal, Stack, TextField, Typography } from '@mui/material';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

interface AddPairModalProps {
  open: boolean;
  onClose: () => void;
}

const AddPairModal: React.FC<AddPairModalProps> = ({ open, onClose }) => {
  const [newPairAddress, setNewPairAddress] = useState<string>('');
  const [newPairName, setNewPairName] = useState<string>('');
  const [newPairPlatform, setNewPairPlatform] = useState<string>('');
  const [newPairWeight, setNewPairWeight] = useState<string>('0');
  const [maxWeight, setMaxWeight] = useState<number>();
  const [error, setError] = useState<string>('');

  const { contract, proposeAddPair, getMaxWeight } = useContract();

  useEffect(() => {
    async function loadContractData() {
      const maxWeight = await getMaxWeight();
      setMaxWeight(Number(maxWeight));
    }
    loadContractData();
  }, [contract]);

  const validateInputs = (): boolean => {
    if (!newPairAddress || !newPairPlatform || !newPairName || newPairWeight === '0') {
      setError('Please fill in all fields');
      return false;
    }
    if (maxWeight && Number(newPairWeight) > maxWeight) {
      setError(`Weight cannot be greater than ${maxWeight}`);
      return false;
    }
    if (!ethers.isAddress(newPairAddress)) {
      setError('Invalid LP token address format');
      return false;
    }
    if (new TextEncoder().encode(newPairPlatform).length > 32) {
      setError('Platform name too long (max 32 bytes)');
      return false;
    }
    setError('');
    return true;
  };

  const handleProposeAddPair = async () => {
    if (!validateInputs()) return;
    
    try {
      await proposeAddPair(newPairAddress, newPairName, newPairPlatform, newPairWeight);
      onClose();
    } catch (err) {
      setError('Failed to propose new pair. Please try again.');
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalBox>
        <Card sx={{ minWidth: 400 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
              Add New Pair
            </Typography>
            
            <Stack spacing={2}>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              
              <TextField 
                label="LP Token Address"
                value={newPairAddress}
                onChange={(e) => setNewPairAddress(e.target.value)}
                variant="outlined"
                fullWidth
              />
              
              <TextField 
                label="LP Token Pair Name"
                value={newPairName}
                onChange={(e) => setNewPairName(e.target.value)}
                variant="outlined"
                fullWidth
              />
              
              <TextField 
                label="Platform Name"
                value={newPairPlatform}
                onChange={(e) => setNewPairPlatform(e.target.value)}
                helperText="Max 32 bytes"
                variant="outlined"
                fullWidth
              />
              
              <TextField 
                label="Weight"
                type="number"
                value={newPairWeight}
                onChange={(e) => setNewPairWeight(e.target.value)}
                helperText={maxWeight ? `Maximum weight: ${maxWeight}` : ''}
                variant="outlined"
                fullWidth
              />
            </Stack>
          </CardContent>
          
          <CardActions sx={{ p: 2 }}>
            <Button 
              fullWidth 
              variant="contained" 
              onClick={handleProposeAddPair}
              size="large"
            >
              Propose New Pair
            </Button>
          </CardActions>
        </Card>
      </ModalBox>
    </Modal>
  );
};

export default AddPairModal;
